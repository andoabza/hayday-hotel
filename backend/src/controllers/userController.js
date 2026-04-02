import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { generateToken } from '../utils/jwt.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { room: true }
        }
      }
    });
    
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profilePicture } = req.body;
    const userId = req.user.id;
    
    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        profilePicture: profilePicture || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        role: true,
      }
    });
    
    res.json({ user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      }
    });
    
    // Invalidate all sessions (optional - force re-login)
    // await prisma.session.deleteMany({ where: { userId } });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Request account deletion (soft delete)
export const requestDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check for active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkOut: { gt: new Date() }
      }
    });
    
    if (activeBookings) {
      return res.status(400).json({ 
        error: 'You have active bookings. Please cancel them before deleting your account.' 
      });
    }
    
    // Soft delete - mark for deletion after 30 days
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDeleted: true,
        deletedAt: deletionDate,
      }
    });
    
    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId } });
    
    res.json({ 
      message: 'Account scheduled for deletion. Your account will be permanently deleted after 30 days if you do not log in.',
      deletionDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule account deletion' });
  }
};

// Cancel account deletion (reactivate)
export const cancelDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      }
    });
    
    res.json({ message: 'Account deletion cancelled. Your account is now active.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
};

// Permanent account deletion (hard delete)
export const deleteAccountPermanent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }
    
    // Delete user and all related data (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    res.json({ message: 'Account permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [totalBookings, totalSpent, upcomingBookings, pastBookings] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.aggregate({
        where: { userId, status: 'CONFIRMED' },
        _sum: { totalPrice: true }
      }),
      prisma.booking.count({
        where: {
          userId,
          status: 'CONFIRMED',
          checkIn: { gt: new Date() }
        }
      }),
      prisma.booking.count({
        where: {
          userId,
          status: { in: ['COMPLETED', 'CANCELLED'] }
        }
      })
    ]);
    
    res.json({
      totalBookings,
      totalSpent: totalSpent._sum.totalPrice || 0,
      upcomingBookings,
      pastBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Update last login
export const updateLastLogin = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  });
};

// Clean up inactive accounts (run via cron job)
export const cleanupInactiveAccounts = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find users marked for deletion whose deletion date has passed
    const usersToDelete = await prisma.user.findMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: new Date() }
      }
    });
    
    // Permanently delete users
    for (const user of usersToDelete) {
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`Permanently deleted user: ${user.email}`);
    }
    
    // Find inactive users (no login for 30+ days and not marked for deletion)
    const inactiveUsers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        lastLoginAt: { lt: thirtyDaysAgo },
        role: 'CUSTOMER'
      }
    });
    
    // Mark inactive users for deletion
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    for (const user of inactiveUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          isDeleted: true,
          deletedAt: deletionDate
        }
      });
      console.log(`Marked inactive user for deletion: ${user.email}`);
    }
    
    return { deleted: usersToDelete.length, marked: inactiveUsers.length };
  } catch (error) {
    console.error('Error cleaning up inactive accounts:', error);
    throw error;
  }
};
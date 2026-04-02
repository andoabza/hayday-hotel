import { prisma } from '../index.js';
import { pricingEngine } from '../services/pricing/advancedPricingEngine.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const totalRevenue = await prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { totalPrice: true },
    });
    const rooms = await prisma.room.count();
    const occupiedRooms = await prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        checkIn: { lte: new Date() },
        checkOut: { gte: new Date() },
      },
    });
    const occupancyRate = rooms > 0 ? (occupiedRooms / rooms) * 100 : 0;

    res.json({
      totalBookings,
      confirmedBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      occupancyRate: Math.round(occupancyRate),
      activeBookings: confirmedBookings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllRooms = async (req, res) => {
  const rooms = await prisma.room.findMany();
  res.json({ rooms });
};

// Create new room with full details
export const createRoom = async (req, res) => {
  try {
    const {
      name,
      type,
      capacity,
      basePrice,
      description,
      images,
      amenities,
      hasKitchen,
      hasBalcony,
      size,
      bedType,
      view,
      floor,
      roomNumber,
      policies,
      cancellationPolicy,
      depositRequired,
      maxStay,
      minStay,
      breakfastIncluded,
      wifiSpeed,
      parkingAvailable
    } = req.body;

    // Validate room number uniqueness
    if (roomNumber) {
      const existingRoom = await prisma.room.findFirst({
        where: { roomNumber }
      });
      if (existingRoom) {
        return res.status(400).json({ error: 'Room number already exists' });
      }
    }

    const room = await prisma.room.create({
      data: {
        name,
        type,
        capacity,
        basePrice,
        description,
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        hasKitchen: hasKitchen || false,
        hasBalcony: hasBalcony || true,
        size: size || 0,
        bedType: bedType || 'Queen',
        view: view || 'City View',
        floor: floor || 1,
        roomNumber: roomNumber || null,
        policies: JSON.stringify(policies || {}),
        cancellationPolicy: cancellationPolicy || 'Free cancellation 48 hours before check-in',
        depositRequired: depositRequired || false,
        maxStay: maxStay || 30,
        minStay: minStay || 1,
        breakfastIncluded: breakfastIncluded || false,
        wifiSpeed: wifiSpeed || '100 Mbps',
        parkingAvailable: parkingAvailable || true
      }
    });

    res.status(201).json({ 
      room: {
        ...room,
        images: JSON.parse(room.images),
        amenities: JSON.parse(room.amenities),
        policies: JSON.parse(room.policies)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle JSON fields
    if (updates.images) updates.images = JSON.stringify(updates.images);
    if (updates.amenities) updates.amenities = JSON.stringify(updates.amenities);
    if (updates.policies) updates.policies = JSON.stringify(updates.policies);

    const room = await prisma.room.update({
      where: { id: parseInt(id) },
      data: updates
    });

    res.json({ 
      room: {
        ...room,
        images: JSON.parse(room.images),
        amenities: JSON.parse(room.amenities),
        policies: JSON.parse(room.policies)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        roomId: parseInt(id),
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkOut: { gt: new Date() }
      }
    });
    
    if (activeBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete room with active bookings' 
      });
    }
    
    await prisma.room.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

// Get room policies
export const getHotelPolicies = async (req, res) => {
  try {
    const policies = {
      checkIn: {
        time: '14:00',
        instructions: 'Early check-in available upon request (subject to availability)',
        requirements: [
          'Valid government ID',
          'Credit card for incidentals',
          'Booking confirmation'
        ]
      },
      checkOut: {
        time: '12:00',
        instructions: 'Late check-out available until 14:00 (50% of nightly rate)',
        lateFee: 'Full night charge after 14:00'
      },
      cancellation: {
        free: 'Free cancellation up to 48 hours before check-in',
        partial: '50% charge for cancellation 24-48 hours before check-in',
        full: '100% charge for cancellation within 24 hours',
        noShow: '100% charge for no-show'
      },
      children: {
        under2: 'Free (using existing bedding)',
        under12: '50% off (using existing bedding)',
        extraBed: '$30 per night for extra bed',
        crib: 'Free crib available upon request'
      },
      pets: {
        allowed: true,
        fee: '$25 per night',
        weightLimit: 'Up to 25 lbs',
        restrictions: 'Pets must be leashed in common areas'
      },
      smoking: {
        allowed: false,
        penalty: '$250 cleaning fee for smoking in room'
      },
      parking: {
        free: true,
        type: 'Secure underground parking',
        spaces: 'Limited availability'
      },
      wifi: {
        free: true,
        speed: 'High-speed fiber optic',
        coverage: 'Throughout the hotel'
      },
      breakfast: {
        included: false,
        price: '$15 per person',
        hours: '6:30 AM - 10:30 AM',
        type: 'Continental and Ethiopian buffet'
      },
      payment: {
        accepted: ['Visa', 'Mastercard', 'Amex', 'Cash', 'Mobile Money'],
        deposit: 'First night required for bookings over 3 nights',
        currency: 'ETB (Ethiopian Birr)'
      },
      housekeeping: {
        daily: 'Standard daily cleaning',
        eco: 'Towel/linen change every 2 days upon request',
        deep: 'Deep cleaning upon checkout'
      },
      amenities: {
        included: [
          'Complimentary bottled water',
          'Coffee/tea making facilities',
          'Toiletries',
          'Hair dryer',
          'Iron and board',
          'Flat-screen TV',
          'Safe deposit box'
        ]
      },
      accessibility: {
        features: [
          'Wheelchair accessible rooms',
          'Elevator access',
          'Wide doorways',
          'Roll-in showers available'
        ]
      },
      events: {
        parties: 'Small gatherings allowed (prior approval required)',
        quietHours: '10:00 PM - 7:00 AM',
        restrictions: 'No external sound systems'
      },
      security: {
        features: [
          '24/7 security guard',
          'CCTV surveillance',
          'Electronic key cards',
          'Safe deposit boxes at reception'
        ]
      }
    };
    
    res.json({ policies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
};

// Update hotel policies
export const updateHotelPolicies = async (req, res) => {
  try {
    const policies = req.body;
    
    // Save to database or file
    await prisma.hotelSettings.upsert({
      where: { key: 'policies' },
      update: { value: JSON.stringify(policies) },
      create: { key: 'policies', value: JSON.stringify(policies) }
    });
    
    res.json({ message: 'Policies updated successfully', policies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update policies' });
  }
};


export const getAllBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, room: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ bookings });
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = await prisma.booking.update({
    where: { id: parseInt(id) },
    data: { status },
  });
  res.json({ booking });
};

export const getOffers = async (req, res) => {
  const offers = await prisma.offer.findMany();
  res.json({ offers });
};

export const createOffer = async (req, res) => {
  const offer = await prisma.offer.create({ data: req.body });
  res.status(201).json({ offer });
};

export const deleteOffer = async (req, res) => {
  const { id } = req.params;
  await prisma.offer.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
};


// Get revenue data for charts
export const getRevenueData = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate;
    const now = new Date();
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: startDate }
      },
      select: {
        totalPrice: true,
        createdAt: true
      }
    });
    
    // Group by date
    const revenueByDate = {};
    bookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + booking.totalPrice;
    });
    
    const data = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
};

// Get room occupancy rates
export const getRoomOccupancy = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
            checkIn: { lte: new Date() },
            checkOut: { gte: new Date() }
          }
        }
      }
    });
    
    const roomsWithOccupancy = rooms.map(room => ({
      id: room.id,
      name: room.name,
      totalBookings: room.bookings.length,
      occupancyRate: Math.min(100, (room.bookings.length / 30) * 100) // Simplified calculation
    }));
    
    res.json({ rooms: roomsWithOccupancy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room occupancy' });
  }
};

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;
    const status = req.query.status;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status === 'active') {
      where.isActive = true;
      where.isDeleted = false;
    } else if (status === 'inactive') {
      where.OR = [
        { isActive: false },
        { isDeleted: true }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { bookings: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalUsers, activeUsers, inactiveUsers, adminUsers, customerUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isDeleted: false } }),
      prisma.user.count({ where: { OR: [{ isActive: false }, { isDeleted: true }] } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } })
    ]);
    
    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      customerUsers,
      newUsersThisMonth
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Get single user details
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { room: true }
        },
        reviews: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;
    
    // Check if email is taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(id) }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        role,
        isActive
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        userId: parseInt(id),
        status: { in: ['PENDING', 'CONFIRMED'] },
        checkOut: { gt: new Date() }
      }
    });
    
    if (activeBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active bookings. Cancel bookings first.' 
      });
    }
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive }
    });
    
    res.json({ 
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
};

// Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Prevent changing the last admin
    if (role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
      
      if (adminCount === 1 && user.role === 'ADMIN') {
        return res.status(400).json({ error: 'Cannot change the last admin user' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    
    res.json({ 
      message: `User role changed to ${role}`,
      role: updatedUser.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change user role' });
  }
};

// Reset user password
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    });
    
    // In a real app, send email with temporary password
    // await sendPasswordResetEmail(user.email, tempPassword);
    
    res.json({ 
      message: 'Password reset successfully',
      tempPassword // Only in development, remove in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Export users to CSV
export const exportUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Last Login', 'Total Bookings'],
      ...users.map(user => [
        user.id,
        user.name,
        user.email,
        user.phone || '',
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        user._count.bookings
      ])
    ].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export users' });
  }
};
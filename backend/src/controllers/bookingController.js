import { prisma } from '../index.js';
import { checkRoomAvailability } from '../services/availabilityService.js';
import { calculatePrice } from '../services/pricingEngine.js';
import { sendBookingConfirmationEmail } from '../utils/email.js';

export const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, adults, children, specialRequest } = req.body;
    const userId = req.user.id;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(409).json({ error: 'Room not available for selected dates' });
    }

    const totalPrice = calculatePrice(room.basePrice, checkInDate, checkOutDate);

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        specialRequest,
        status: 'PENDING',
        totalPrice,
      },
      include: { room: true, user: true },
    });

    res.status(201).json({ booking, requiresPayment: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { user: true, room: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED', paymentIntentId },
    });

    await sendBookingConfirmationEmail(booking.user.email, booking);
    res.json({ booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { room: true }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if cancellation is allowed (at least 24 hours before check-in)
    const checkIn = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 24 && req.user.role !== 'ADMIN') {
      return res.status(400).json({ 
        error: 'Cancellation not allowed within 24 hours of check-in' 
      });
    }
    
    const cancelledBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });
    
    // In a real implementation, process refund via Stripe
    // await stripe.refunds.create({ payment_intent: booking.paymentIntentId });
    
    res.json({ 
      booking: cancelledBooking,
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
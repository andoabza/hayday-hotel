import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllBookings,
  updateBookingStatus,
  getOffers,
  createOffer,
  deleteOffer,
  getAllUsers,
  getRevenueData,
  getRoomOccupancy,
  getHotelPolicies,
  updateHotelPolicies
} from '../controllers/adminController.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueData);
router.get('/room-occupancy', getRoomOccupancy);

// Rooms
router.get('/rooms', getAllRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Bookings
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

// Users
router.get('/users', getAllUsers);

// Offers
router.get('/offers', getOffers);
router.post('/offers', createOffer);
router.delete('/offers/:id', deleteOffer);

// Policies
router.get('/policies', getHotelPolicies);
router.put('/policies', updateHotelPolicies);

export default router;
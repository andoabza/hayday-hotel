import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getHotelInfo,
  getServices,
  bookAirportShuttle,
  createReview,
  getReviews,
  getEvents,
} from '../controllers/hotelController.js';
import { getHotelPolicies } from '../controllers/adminController.js';

const router = Router();

router.get('/info', getHotelInfo);
router.get('/services', getServices);
router.get('/reviews', getReviews);
router.get('/events', getEvents);
router.get('/policies', getHotelPolicies);
router.post('/shuttle', authenticate, bookAirportShuttle);
router.post('/reviews', authenticate, createReview);

export default router;
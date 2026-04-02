import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  createBooking, 
  confirmBooking, 
  getUserBookings,
  cancelBooking 
} from '../controllers/bookingController.js';

const router = Router();

router.use(authenticate);
router.post('/', createBooking);
router.post('/confirm', confirmBooking);
router.get('/me', getUserBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
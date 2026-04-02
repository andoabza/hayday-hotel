import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  requestDeletion,
  cancelDeletion,
  deleteAccountPermanent,
  getUserStats
} from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/request-deletion', requestDeletion);
router.post('/cancel-deletion', cancelDeletion);
router.delete('/account', deleteAccountPermanent);
router.get('/stats', getUserStats);

export default router;
import express from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPaymentIntent, stripeWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/:id', getPaymentDetails);

export default router;
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true  // ✅ Allow null values initially
  },
  transactionId: {
    type: String,
    unique: true,  
    sparse: true   // ✅ Fix duplicate key error for null values
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  invoiceUrl: {
    type: String
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;

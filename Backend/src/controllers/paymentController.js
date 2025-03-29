import {razorpayInstance} from '../config/razorpayConfig.js';
import {Payment} from '../models/index.js';
import {Patient }from '../models/index.js';
import { generateInvoice } from '../utils/pdfGenerator.js';
import crypto from 'crypto';

// Create a new payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { patientId, amount } = req.body;
    
    if (!patientId || !amount) {
      return res.status(400).json({ success: false, message: 'Patient ID and amount are required' });
    }
    
    // Fix: Query using patientId only (not _id)
    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        patientId: patient.patientId,
        patientName: patient.name
      }
    };

    const order = await razorpayInstance.orders.create(options);
    
    // Save order in database
    const payment = await Payment.create({
      patientId: patient.patientId,
      razorpayOrderId: order.id,
      transactionId: order.id, // ✅ Assign order ID to transactionId to prevent null
      amount,
      currency: 'INR'
    });
    

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: razorpayInstance.key_id,
        patient: {
          id: patient.patientId,
          name: patient.name,
          email: patient.email,
          phone: patient.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', razorpayInstance.key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    // Update payment in database
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { 
        razorpayPaymentId,
        status: 'paid'
      },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Find the patient
    const patient = await Patient.findOne({ patientId: payment.patientId });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Update the latest check-in with payment ID
    if (patient.checkIns.length > 0) {
      const latestCheckIn = patient.checkIns[patient.checkIns.length - 1];
      latestCheckIn.paymentId = payment.razorpayPaymentId;
      await patient.save();
    }
    
    // Generate invoice
    const invoiceUrl = await generateInvoice(payment, patient);
    
    // Update payment with invoice URL
    payment.invoiceUrl = invoiceUrl;
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment.razorpayPaymentId,
        invoiceUrl: payment.invoiceUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findOne({
      $or: [
        { _id: id },
        { razorpayOrderId: id },
        { razorpayPaymentId: id }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

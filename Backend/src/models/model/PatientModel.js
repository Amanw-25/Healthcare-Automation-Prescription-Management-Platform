import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  age: {
    type: Number
  },
  weight: {
    type: Number
  },
  address: {
    type: String
  },
  medicalHistory: {
    type: [String], // ✅ Accepts an array of strings
    default: []
  },
  lastVisit: {
    type: Date
  },
  checkIns: [{
    date: {
      type: Date,
      default: Date.now
    },
    reason: String,
    paymentId: String
  }]
}, { timestamps: true });

// ✅ Fix: Generate `patientId` correctly
patientSchema.pre('validate', async function(next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments() + 1;
    this.patientId = `P${String(count).padStart(6, '0')}`;
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;

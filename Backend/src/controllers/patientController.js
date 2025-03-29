import {Patient} from '../models/index.js';
import mongoose from 'mongoose';

// Search for a patient by ID, name, or phone number
export const searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    // Search by patientId, name, or phone
    const patients = await Patient.find({
      $or: [
        { patientId: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { phone: query }
      ]
    });
    
    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'No patients found' });
    }
    
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findOne({ 
      $or: [
        { _id: id },
        { patientId: id }
      ]
    });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    const { name, phone, email, age, weight, address, medicalHistory } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }
    
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ phone });
    
    if (existingPatient) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient with this phone number already exists',
        data: existingPatient
      });
    }
    
    const newPatient = await Patient.create({
      name,
      phone,
      email,
      age,
      weight,
      address,
      medicalHistory
    });
    
    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient information
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findOneAndUpdate(
      { $or: [{ _id: id }, { patientId: id }] },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check-in a patient
export const checkInPatient = async (req, res) => {
  try {
    const { id } = req.params;  // This can be an ObjectId or patientId
    const { reason } = req.body;

    let query = { patientId: id }; // Default search by patientId

    // Check if id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { patientId: id }] };
    }

    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Add check-in details
    patient.checkIns.push({ 
      date: new Date(),
      reason 
    });

    patient.lastVisit = new Date();
    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: 'Patient checked in successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
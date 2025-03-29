import express from 'express';
import {
  searchPatient,
  getPatientById,
  createPatient,
  updatePatient,
  checkInPatient
} from '../controllers/patientController.js';

const router = express.Router();

router.get('/search', searchPatient);
router.get('/:id', getPatientById);
router.post('/create', createPatient);
router.put('/:id', updatePatient);
router.post('/:id/checkin', checkInPatient);

export default router;
import express from "express";
import {
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
} from "../controllers/appointmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for receptionist & patients
router.post("/schedule", authenticate, scheduleAppointment);
router.put("/reschedule/:appointmentId", authenticate, rescheduleAppointment);
router.delete("/cancel/:appointmentId", authenticate, cancelAppointment);
router.get("/patient/:patientId", authenticate, getAppointmentsByPatient);
router.get("/doctor/:doctorId", authenticate, getAppointmentsByDoctor);

export default router;

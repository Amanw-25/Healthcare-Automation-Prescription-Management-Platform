import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "UPI"], required: true },
    status: { type: String, enum: ["successful", "failed", "pending"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

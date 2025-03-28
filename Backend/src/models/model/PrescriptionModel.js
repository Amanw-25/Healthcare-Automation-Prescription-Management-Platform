import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, unique: true, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medications: [
      {
        name: String,
        dosage: String,
        instructions: String,
      },
    ],
    sentToPharmacy: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);

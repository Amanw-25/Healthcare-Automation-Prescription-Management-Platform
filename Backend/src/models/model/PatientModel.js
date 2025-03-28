import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    weight:{type:String,required:true},
    phone: { type: String, required: true },
    address: { type: String },
    medicalHistory: [
      {
        condition: String,
        medications: [String],
        allergies: [String],
        lastVisit: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);

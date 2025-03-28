import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    stock: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Pharmacy", pharmacySchema);

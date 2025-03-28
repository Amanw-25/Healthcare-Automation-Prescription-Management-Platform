import Patient from "../models/Patient.js";

// 📌 Search Patient by Name, ID, or Phone
export const searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { patientId: query },
        { phone: query },
      ],
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error searching patient", error });
  }
};

// 📌 Register New Patient
export const registerPatient = async (req, res) => {
  try {
    const { name, age, gender,weight, phone, address, medicalHistory } = req.body;

    // Generate unique patient ID
    const patientId = `PAT-${Date.now()}`;

    const newPatient = new Patient({
      patientId,
      name,
      age,
      weight,
      gender,
      phone,
      address,
      medicalHistory,
    });

    await newPatient.save();
    res.status(201).json({ message: "Patient registered successfully", patientId });
  } catch (error) {
    res.status(500).json({ message: "Error registering patient", error });
  }
};

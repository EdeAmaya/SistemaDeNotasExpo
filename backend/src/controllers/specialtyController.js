const specialtyController = {};

import specialtyModel from "../models/Specialty.js"; // Modelo

// Select
specialtyController.getSpecialties = async (req,res) => {
  const specialties = await specialtyModel.find()
  res.json(specialties)
};

// Insert
specialtyController.insertSpecialty = async (req,res) =>{
    const{specialtyName, letterSpecialty} = req.body;
    const newSpecialty = new specialtyModel({specialtyName, letterSpecialty})
    await newSpecialty.save()
    res.json({message: "specialty saved"})
};

// Delete
specialtyController.deleteSpecialty = async(req,res) =>{
    await specialtyModel.findByIdAndDelete(req.params.id);
    res.json({message: "specialty deleted"})
};

// Update
specialtyController.updateSpecialty = async(req,res) =>{
    const {specialtyName, letterSpecialty} = req.body;
    const updateSpecialty = await specialtyModel.findByIdAndUpdate(req.params.id,{specialtyName, letterSpecialty},{new: true})
    res.json({message: "specialty updated"})
}

export default specialtyController;
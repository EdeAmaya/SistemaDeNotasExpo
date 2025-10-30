const sectionController = {};

import sectionModel from "../models/Section.js"; // Modelo

// Select
sectionController.getSections = async (req,res) => {
  const sections = await sectionModel.find()
  res.json(sections)
};

// Insert
sectionController.insertSection = async (req,res) =>{
    const{sectionName} = req.body;
    const newSection = new sectionModel({sectionName})
    await newSection.save()
    res.json({message: "section saved"})
};

// Delete
sectionController.deleteSection = async(req,res) =>{
    await sectionModel.findByIdAndDelete(req.params.id);
    res.json({message: "section deleted"})
};

// Update
sectionController.updateSection = async(req,res) =>{
    const {sectionName} = req.body;
    const updateSection = await sectionModel.findByIdAndUpdate(req.params.id,{sectionName},{new: true})
    res.json({message: "section updated"})
}

export default sectionController;
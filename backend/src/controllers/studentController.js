const studentController = {};

import studentModel from "../models/Student.js";

//Select

studentController.getStudents = async (req,res) => {
  const students = await studentModel.find().populate("idLevel").populate("idSection").populate("idSpecialty").populate("projectId")
  res.json(students)
};

//Insert

studentController.insertStudent = async (req,res) =>{
    const{studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId} = req.body;
    const newStudent = new studentModel({studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId})
    await newStudent.save()
    res.json({message: "student saved"})
};

//Delete

studentController.deleteStudent = async(req,res) =>{
    await studentModel.findByIdAndDelete(req.params.id);
    res.json({message: "student deleted"})
};

//Update

studentController.updateStudent = async(req,res) =>{
    const {studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId} = req.body;
    const updateStudent = await studentModel.findByIdAndUpdate(req.params.id,{studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId},{new: true})
    res.json({message: "student updated"})
}

export default studentController;
const studentController = {};

import studentModel from "../models/Student.js";

//Select

studentController.getStudents = async (req,res) => {
  try {
    const students = await studentModel.find()
      .populate("idLevel")
      .populate("idSection")
      .populate("idSpecialty")
      .populate("projectId");
    res.json(students);
  } catch (error) {
    res.status(500).json({ 
      message: "Error al obtener estudiantes", 
      error: error.message 
    });
  }
};

// Verificar si un código de estudiante ya existe
studentController.checkStudentCode = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const { excludeId } = req.query; // Para excluir un estudiante específico (útil en edición)
    
    let query = { studentCode: parseInt(studentCode) };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingStudent = await studentModel.findOne(query);
    
    if (existingStudent) {
      res.json({ 
        exists: true, 
        message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
        student: {
          name: existingStudent.name,
          lastName: existingStudent.lastName,
          id: existingStudent._id
        }
      });
    } else {
      res.json({ 
        exists: false, 
        message: 'Código disponible' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error al verificar código", 
      error: error.message 
    });
  }
};

//Insert

studentController.insertStudent = async (req,res) => {
  try {
    const { studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId } = req.body;
    
    // Verificar si el código ya existe antes de crear
    const existingStudent = await studentModel.findOne({ studentCode: parseInt(studentCode) });
    if (existingStudent) {
      return res.status(400).json({
        message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
        error: "DUPLICATE_CODE"
      });
    }
    
    const newStudent = new studentModel({
      studentCode: parseInt(studentCode), 
      name: name.trim(), 
      lastName: lastName.trim(), 
      idLevel, 
      idSection, 
      idSpecialty: idSpecialty || null, 
      projectId: projectId || null
    });
    
    const savedStudent = await newStudent.save();
    
    res.status(201).json({
      message: "Estudiante registrado exitosamente",
      student: savedStudent
    });
    
  } catch (error) {
    if (error.code === 11000) {
      // Error de duplicado de MongoDB
      res.status(400).json({
        message: "El código de estudiante ya existe. Por favor, use un código diferente.",
        error: "DUPLICATE_CODE"
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        message: "Datos inválidos",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error al registrar estudiante",
        error: error.message
      });
    }
  }
};

//Delete

studentController.deleteStudent = async(req,res) => {
  try {
    const deletedStudent = await studentModel.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({
        message: "Estudiante no encontrado"
      });
    }
    
    res.json({
      message: "Estudiante eliminado exitosamente",
      student: deletedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar estudiante",
      error: error.message
    });
  }
};

//Update

studentController.updateStudent = async(req,res) => {
  try {
    const { studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId } = req.body;
    const studentId = req.params.id;
    
    // Verificar si el nuevo código ya existe en otro estudiante
    if (studentCode) {
      const existingStudent = await studentModel.findOne({ 
        studentCode: parseInt(studentCode),
        _id: { $ne: studentId } // Excluir el estudiante actual
      });
      
      if (existingStudent) {
        return res.status(400).json({
          message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
          error: "DUPLICATE_CODE"
        });
      }
    }
    
    const updateData = {
      studentCode: parseInt(studentCode), 
      name: name.trim(), 
      lastName: lastName.trim(), 
      idLevel, 
      idSection, 
      idSpecialty: idSpecialty || null, 
      projectId: projectId || null
    };
    
    const updatedStudent = await studentModel.findByIdAndUpdate(
      studentId, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({
        message: "Estudiante no encontrado"
      });
    }
    
    res.json({
      message: "Estudiante actualizado exitosamente",
      student: updatedStudent
    });
    
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "El código de estudiante ya existe. Por favor, use un código diferente.",
        error: "DUPLICATE_CODE"
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        message: "Datos inválidos",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error al actualizar estudiante",
        error: error.message
      });
    }
  }
};

export default studentController;
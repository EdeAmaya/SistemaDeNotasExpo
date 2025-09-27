const projectController = {};

import projectModel from "../models/Project.js";

//Select
projectController.getProjects = async (req,res) => {
  try {
    const projects = await projectModel.find()
      .populate("idLevel")
      .populate("idSection")
      .populate("selectedSpecialty") // NUEVO: Popular especialidad
      .populate("assignedStudents")
    res.json(projects)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
};

//Insert
projectController.insertProject = async (req,res) => {
  try {
    // ACTUALIZADO: Agregar teamNumber y selectedSpecialty
    const {
      projectId, 
      projectName, 
      googleSitesLink, 
      idLevel, 
      idSection, 
      selectedSpecialty, 
      teamNumber, 
      status, 
      assignedStudents
    } = req.body;

    // Validación: Verificar que teamNumber esté presente
    if (!teamNumber || teamNumber < 1) {
      return res.status(400).json({
        error: "INVALID_TEAM_NUMBER",
        message: "El número de equipo es requerido y debe ser mayor a 0"
      });
    }

    // Verificar ID duplicado
    const existingProject = await projectModel.findOne({ 
      projectId: projectId.trim() 
    });
    
    if (existingProject) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: `El ID ${projectId} ya está en uso por otro proyecto`
      });
    }

    const newProject = new projectModel({
      projectId: projectId.trim(), 
      projectName: projectName.trim(), 
      googleSitesLink: googleSitesLink ? googleSitesLink.trim() : null, 
      idLevel, 
      idSection: idSection || null, // Puede ser null para bachillerato
      selectedSpecialty: selectedSpecialty || null, // Puede ser null para básica
      teamNumber: parseInt(teamNumber), // NUEVO: Guardar número de equipo
      status: status || 'Activo',
      assignedStudents: assignedStudents || []
    });

    const savedProject = await newProject.save();
    
    // Responder con el proyecto guardado
    res.status(201).json({
      message: "Proyecto guardado exitosamente",
      project: savedProject
    });

  } catch (error) {
    console.error("Error al insertar proyecto:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Error de validación en los datos del proyecto",
        details: error.message
      });
    }
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: "Ya existe un proyecto con este ID"
      });
    }
    
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
      details: error.message
    });
  }
};

//Delete
projectController.deleteProject = async(req,res) => {
  try {
    const deletedProject = await projectModel.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({
        error: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado"
      });
    }
    
    res.json({
      message: "Proyecto eliminado exitosamente",
      deletedProject: deletedProject
    });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error al eliminar el proyecto",
      details: error.message
    });
  }
};

//Update
projectController.updateProject = async(req,res) => {
  try {
    // ACTUALIZADO: Agregar teamNumber y selectedSpecialty
    const {
      projectId, 
      projectName, 
      googleSitesLink, 
      idLevel, 
      idSection, 
      selectedSpecialty, 
      teamNumber, 
      status, 
      assignedStudents
    } = req.body;

    // Validación: Verificar que teamNumber esté presente
    if (!teamNumber || teamNumber < 1) {
      return res.status(400).json({
        error: "INVALID_TEAM_NUMBER",
        message: "El número de equipo es requerido y debe ser mayor a 0"
      });
    }

    // Verificar que el proyecto existe
    const existingProject = await projectModel.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        error: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado"
      });
    }

    // Verificar ID duplicado (excluyendo el proyecto actual)
    const duplicateProject = await projectModel.findOne({ 
      projectId: projectId.trim(),
      _id: { $ne: req.params.id } // Excluir el proyecto actual
    });
    
    if (duplicateProject) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: `El ID ${projectId} ya está en uso por otro proyecto`
      });
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
      req.params.id,
      {
        projectId: projectId.trim(), 
        projectName: projectName.trim(), 
        googleSitesLink: googleSitesLink ? googleSitesLink.trim() : null, 
        idLevel, 
        idSection: idSection || null, // Puede ser null para bachillerato
        selectedSpecialty: selectedSpecialty || null, // Puede ser null para básica
        teamNumber: parseInt(teamNumber), // NUEVO: Actualizar número de equipo
        status: status || 'Activo',
        assignedStudents: assignedStudents || []
      },
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del esquema
      }
    );

    res.json({
      message: "Proyecto actualizado exitosamente",
      project: updatedProject
    });

  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Error de validación en los datos del proyecto",
        details: error.message
      });
    }
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: "Ya existe un proyecto con este ID"
      });
    }
    
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error al actualizar el proyecto",
      details: error.message
    });
  }
}

export default projectController;
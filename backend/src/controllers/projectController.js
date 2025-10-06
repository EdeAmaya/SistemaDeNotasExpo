const projectController = {};

import projectModel from "../models/Project.js";
import ActivityLogger from "../utils/activityLogger.js";

//Select - Con filtrado según rol del usuario
projectController.getProjects = async (req, res) => {
  try {
    const user = req.user; // Usuario autenticado desde el middleware
    
    let query = {};

    // Si es Docente o Evaluador, solo puede ver los proyectos de su nivel, sección y especialidad
    if (user.role === 'Docente' || user.role === 'Evaluador') {
      query = {
        idLevel: user.idLevel
      };

      // Si el usuario tiene especialidad, también filtrar por ella
      if (user.idSpecialty) {
        query.selectedSpecialty = user.idSpecialty;
      }

      // Si el usuario tiene sección, también filtrar por ella
      if (user.idSection) {
        query.idSection = user.idSection;
      }
    }

    // Si es Estudiante, mostrar solo su proyecto asignado
    if (user.role === 'Estudiante') {
      query = {
        assignedStudents: user._id
      };
    }

    // Admin ve todos los proyectos
    const projects = await projectModel.find(query)
      .populate("idLevel")
      .populate("idSection")
      .populate("selectedSpecialty")
      .populate("assignedStudents");

    res.json(projects);

  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({
      message: "Error al obtener proyectos",
      error: error.message
    });
  }
};

//Insert
projectController.insertProject = async (req,res) => {
  try {
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

    if (!teamNumber || teamNumber < 1) {
      return res.status(400).json({
        error: "INVALID_TEAM_NUMBER",
        message: "El número de equipo es requerido y debe ser mayor a 0"
      });
    }

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
      idSection: idSection || null,
      selectedSpecialty: selectedSpecialty || null,
      teamNumber: parseInt(teamNumber),
      status: status || 'Activo',
      assignedStudents: assignedStudents || []
    });

    const savedProject = await newProject.save();
    
    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'CREATE_PROJECT',
      `Creó el proyecto "${savedProject.projectName}"`,
      'Project',
      savedProject._id,
      { projectId: savedProject.projectId },
      req
    );
    
    res.status(201).json({
      message: "Proyecto guardado exitosamente",
      project: savedProject
    });

  } catch (error) {
    console.error("Error al insertar proyecto:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Error de validación en los datos del proyecto",
        details: error.message
      });
    }
    
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
    
    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'DELETE_PROJECT',
      `Eliminó el proyecto "${deletedProject.projectName}"`,
      'Project',
      deletedProject._id,
      { projectId: deletedProject.projectId },
      req
    );
    
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

    if (!teamNumber || teamNumber < 1) {
      return res.status(400).json({
        error: "INVALID_TEAM_NUMBER",
        message: "El número de equipo es requerido y debe ser mayor a 0"
      });
    }

    const existingProject = await projectModel.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        error: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado"
      });
    }

    const duplicateProject = await projectModel.findOne({ 
      projectId: projectId.trim(),
      _id: { $ne: req.params.id }
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
        idSection: idSection || null,
        selectedSpecialty: selectedSpecialty || null,
        teamNumber: parseInt(teamNumber),
        status: status || 'Activo',
        assignedStudents: assignedStudents || []
      },
      { 
        new: true,
        runValidators: true
      }
    );

    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'UPDATE_PROJECT',
      `Editó el proyecto "${updatedProject.projectName}"`,
      'Project',
      updatedProject._id,
      { projectId: updatedProject.projectId },
      req
    );

    res.json({
      message: "Proyecto actualizado exitosamente",
      project: updatedProject
    });

  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Error de validación en los datos del proyecto",
        details: error.message
      });
    }
    
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
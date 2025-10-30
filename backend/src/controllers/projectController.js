const projectController = {};

import projectModel from "../models/Project.js"; // Modelo
import studentModel from "../models/Student.js"; // Modelo de estudiante
import ActivityLogger from "../utils/activityLogger.js"; // Importar el logger de actividad

// Select - Con filtrado según rol del usuario
projectController.getProjects = async (req, res) => {
  try {
    // Obtener el usuario desde la solicitud
    const user = req.user;
    
    let query = {};

    // Filtrado según rol
    if (user.role === 'Docente' || user.role === 'Evaluador') {
      query = {
        idLevel: user.idLevel // Filtrar por el nivel asignado al docente/evaluador
      };

      if (user.idSpecialty) {
        query.selectedSpecialty = user.idSpecialty; // Filtrar por la especialidad asignada
      }

      if (user.idSection) {
        query.idSection = user.idSection; // Filtrar por la sección asignada
      }
    }

    if (user.role === 'Estudiante') {
      query = {
        assignedStudents: user._id // Mostrar solo el proyecto asignado al estudiante
      };
    }

    // Consulta a la base de datos
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

// Insert
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

    if (!teamNumber || teamNumber < 1) { // Validar teamNumber
      return res.status(400).json({
        error: "INVALID_TEAM_NUMBER",
        message: "El número de equipo es requerido y debe ser mayor a 0"
      });
    }

    const existingProject = await projectModel.findOne({ 
      projectId: projectId.trim() // Verificar duplicados
    });
    
    if (existingProject) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: `El ID ${projectId} ya está en uso por otro proyecto`
      });
    }

    // Crear nuevo proyecto
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

    // Guardar el proyecto
    const savedProject = await newProject.save();
    
    // Actualizar el projectId en los estudiantes asignados
    if (assignedStudents && assignedStudents.length > 0) {
      await studentModel.updateMany(
        { _id: { $in: assignedStudents } },
        { $set: { projectId: savedProject._id } }
      );
    }
    
    // Registrar la actividad
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
    
    // Manejo de errores específicos
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

// Delete
projectController.deleteProject = async(req,res) => {
  try {
    const deletedProject = await projectModel.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({
        error: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado"
      });
    }
    
    // Remover la referencia del proyecto en los estudiantes asignados
    if (deletedProject.assignedStudents && deletedProject.assignedStudents.length > 0) {
      await studentModel.updateMany(
        { _id: { $in: deletedProject.assignedStudents } },
        { $set: { projectId: null } }
      );
    }
    
    // Registrar la actividad
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

// Update
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

    // Verificar si el proyecto existe
    const existingProject = await projectModel.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        error: "PROJECT_NOT_FOUND",
        message: "Proyecto no encontrado"
      });
    }

    // Verificar duplicados de projectId en otros proyectos
    const duplicateProject = await projectModel.findOne({ 
      projectId: projectId.trim(),
      _id: { $ne: req.params.id }
    });
    
    // Si hay un duplicado, retornar error
    if (duplicateProject) {
      return res.status(400).json({
        error: "DUPLICATE_PROJECT_ID",
        message: `El ID ${projectId} ya está en uso por otro proyecto`
      });
    }

    // Obtener estudiantes anteriores
    const previousStudents = existingProject.assignedStudents.map(id => id.toString());
    const newStudents = (assignedStudents || []).map(id => id.toString());

    // Estudiantes que fueron removidos del proyecto
    const removedStudents = previousStudents.filter(id => !newStudents.includes(id));
    
    // Estudiantes que fueron agregados al proyecto
    const addedStudents = newStudents.filter(id => !previousStudents.includes(id));

    // Remover projectId de estudiantes que ya no están en el proyecto
    if (removedStudents.length > 0) {
      await studentModel.updateMany(
        { _id: { $in: removedStudents } },
        { $set: { projectId: null } }
      );
    }

    // Agregar projectId a los nuevos estudiantes
    if (addedStudents.length > 0) {
      await studentModel.updateMany(
        { _id: { $in: addedStudents } },
        { $set: { projectId: req.params.id } }
      );
    }

    // Actualizar el proyecto
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

    // Registrar la actividad
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
    
    // Manejo de errores específicos
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
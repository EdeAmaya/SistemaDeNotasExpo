import ProjectScore from "../models/ProjectScore.js";
import Project from "../models/Project.js";

const projectScoreController = {};

// ===============================
// GET - Listar todos los puntajes
// ===============================
projectScoreController.getProjectScores = async (req, res) => {
  try {
    const scores = await ProjectScore.find()
      .populate("projectId");

    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project scores",
      error: error.message,
      stack: error.stack
    });
  }
};

// ===============================
// GET - Obtener puntaje por ID
// ===============================
projectScoreController.getProjectScoreById = async (req, res) => {
  try {
    const score = await ProjectScore.findById(req.params.id)
      .populate("projectId");

    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Project score not found"
      });
    }

    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project score",
      error: error.message,
      stack: error.stack
    });
  }
};

// ===============================
// GET - Obtener puntajes finales (con promedio total)
// ===============================
projectScoreController.getProjectFinalScores = async (req, res) => {
  try {
    const scores = await ProjectScore.find().populate("projectId");

    const results = scores.map(score => {
      const internas = score.evaluacionesInternas || [];
      const externas = score.evaluacionesExternas || [];

      const notasInternas = internas.map(ev => ev.notaFinal || 0);
      const notasExternas = externas.map(ev => ev.notaFinal || 0);

      // Promedios individuales
      const promedioInterno = notasInternas.length
        ? notasInternas.reduce((a, b) => a + b, 0) / notasInternas.length
        : 0;

      const promedioExterno = notasExternas.length
        ? notasExternas.reduce((a, b) => a + b, 0) / notasExternas.length
        : 0;

      // Promedio total (ajusta la fórmula si quieres distinto peso)
      const totalNotas = [...notasInternas, ...notasExternas];
      const promedioTotal = totalNotas.length
        ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
        : 0;

      return {
        projectId: score.projectId?._id,
        projectName: score.projectId?.projectName || "Sin nombre",
        promedioInterno,
        promedioExterno,
        promedioTotal,
        totalEvaluaciones: totalNotas.length
      };
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating final project scores",
      error: error.message,
      stack: error.stack
    });
  }
};

// ===============================
// GET - Obtener puntaje por projectId
// ===============================
projectScoreController.getProjectScoreByProjectId = async (req, res) => {
  try {
    const score = await ProjectScore.findOne({ projectId: req.params.projectId })
      .populate("projectId")
      .populate({
        path: "evaluacionesInternas",
        populate: {
          path: "rubricId",
          populate: [
            { path: "stageId" },
            { path: "specialtyId" },
            { path: "levelId" }
          ]
        }
      })
      .populate({
        path: "evaluacionesExternas",
        populate: {
          path: "rubricId",
          populate: [
            { path: "stageId" },
            { path: "specialtyId" },
            { path: "levelId" }
          ]
        }
      });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Project score not found for this project"
      });
    }

    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project score by projectId",
      error: error.message,
      stack: error.stack
    });
  }
};

// ===============================
// GET - Obtener proyectos con puntajes por sección
// ===============================
projectScoreController.getProjectScoresBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const projects = await Project.find({ idSection: sectionId })
      .populate("idLevel")
      .populate("idSection")
      .populate("selectedSpecialty")
      .populate("assignedStudents")
      .sort({ teamNumber: 1 });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this section"
      });
    }

    const projectsWithScores = await Promise.all(
      projects.map(async (project) => {
        const score = await ProjectScore.findOne({ projectId: project._id });

        const internas = score?.evaluacionesInternas || [];
        const externas = score?.evaluacionesExternas || [];

        const notasInternas = internas.map(ev => ev.notaFinal || 0);
        const notasExternas = externas.map(ev => ev.notaFinal || 0);

        const promedioInterno = notasInternas.length
          ? notasInternas.reduce((a, b) => a + b, 0) / notasInternas.length
          : 0;

        const promedioExterno = notasExternas.length
          ? notasExternas.reduce((a, b) => a + b, 0) / notasExternas.length
          : 0;

        const totalNotas = [...notasInternas, ...notasExternas];
        const promedioTotal = totalNotas.length
          ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
          : 0;

        return {
          _id: project._id,
          projectId: project.projectId,
          projectName: project.projectName,
          teamNumber: project.teamNumber,
          googleSitesLink: project.googleSitesLink,
          level: project.idLevel,
          section: project.idSection,
          specialty: project.selectedSpecialty,
          students: project.assignedStudents,
          status: project.status,
          scores: {
            promedioInterno: parseFloat(promedioInterno.toFixed(2)),
            promedioExterno: parseFloat(promedioExterno.toFixed(2)),
            promedioTotal: parseFloat(promedioTotal.toFixed(2)),
            totalEvaluaciones: totalNotas.length,
            evaluacionesInternas: internas.length,
            evaluacionesExternas: externas.length,
            notaFinalGlobal: score?.notaFinalGlobal || 0
          }
        };
      })
    );

    projectsWithScores.sort((a, b) => b.scores.promedioTotal - a.scores.promedioTotal);

    res.status(200).json({
      success: true,
      data: projectsWithScores,
      meta: {
        total: projectsWithScores.length,
        section: projects[0]?.idSection?.sectionName || "N/A",
        level: projects[0]?.idLevel?.levelName || "N/A"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project scores by section",
      error: error.message,
      stack: error.stack
    });
  }
};

// ===============================
// POST - Crear puntaje
// ===============================
projectScoreController.createProjectScore = async (req, res) => {
  try {
    const { projectId, evaluacionesInternas, evaluacionesExternas } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required"
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const score = await ProjectScore.create({
      projectId,
      evaluacionesInternas: evaluacionesInternas || [],
      evaluacionesExternas: evaluacionesExternas || []
    });

    res.status(201).json({ success: true, data: score });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating project score",
      error: error.message
    });
  }
};

// ===============================
// PUT - Actualizar puntaje
// ===============================
projectScoreController.updateProjectScore = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
    }

    const score = await ProjectScore.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("projectId");

    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Project score not found"
      });
    }

    res.status(200).json({ success: true, data: score });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating project score",
      error: error.message
    });
  }
};

// ===============================
// DELETE - Eliminar puntaje
// ===============================
projectScoreController.deleteProjectScore = async (req, res) => {
  try {
    const score = await ProjectScore.findByIdAndDelete(req.params.id);
    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Project score not found"
      });
    }

    res.status(200).json({ success: true, message: "Project score deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting project score",
      error: error.message,
      stack: error.stack
    });
  }
};

export default projectScoreController;
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

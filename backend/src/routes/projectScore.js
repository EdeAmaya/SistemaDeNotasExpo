// Rutas para la gestión de puntuaciones de proyectos
import express from "express";
import projectScoreController from "../controllers/projectScoresController.js"; // Controlador

const router = express.Router();

// Rutas CRUD para puntuaciones de proyectos
router.route("/")
  .get(projectScoreController.getProjectScores)
  .post(projectScoreController.createProjectScore);

// Rutas para operaciones específicas
router.get("/project-averages", projectScoreController.getProjectFinalScores);
router.get("/project/:projectId", projectScoreController.getProjectScoreByProjectId);

// Obtener puntuaciones por sección
router.get("/section/:sectionId", projectScoreController.getProjectScoresBySection);
router.patch("/:projectId/promedio-interno", projectScoreController.updatePromedioInterno); // Actualizar promedio interno

// Rutas para operaciones con ID específico
router.route("/:id")
  .get(projectScoreController.getProjectScoreById)
  .put(projectScoreController.updateProjectScore)
  .delete(projectScoreController.deleteProjectScore);

export default router;
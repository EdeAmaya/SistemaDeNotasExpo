// Rutas para la gestión de evaluaciones
import express from "express";
import evaluationController from "../controllers/evaluationsController.js"; // Controlador

const router = express.Router();

// Evaluaciones
// Rutas CRUD para evaluaciones
router.route("/")
    .get(evaluationController.getEvaluations)
    .post(evaluationController.createEvaluation);

// Obtener evaluaciones por proyecto
router.get("/project/:projectId", evaluationController.getEvaluationsByProject);

// Rutas para operaciones con ID específico
router.route("/:id")
    .get(evaluationController.getEvaluationById)
    .put(evaluationController.updateEvaluation)
    .delete(evaluationController.deleteEvaluation);

export default router;

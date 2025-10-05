import express from "express";
import evaluationController from "../controllers/evaluationsController.js";

const router = express.Router();

// Evaluaciones
router.route("/")
    .get(evaluationController.getEvaluations)
    .post(evaluationController.createEvaluation);

router.get("/project/:projectId", evaluationController.getEvaluationsByProject);

router.route("/:id")
    .get(evaluationController.getEvaluationById)
    .put(evaluationController.updateEvaluation)
    .delete(evaluationController.deleteEvaluation);

export default router;

import express from "express";
import projectScoreController from "../controllers/projectScoresController.js";

const router = express.Router();

router.route("/")
  .get(projectScoreController.getProjectScores)
  .post(projectScoreController.createProjectScore);

router.get("/project-averages", projectScoreController.getProjectFinalScores);
router.get("/project/:projectId", projectScoreController.getProjectScoreByProjectId);

router.get("/section/:sectionId", projectScoreController.getProjectScoresBySection);
router.patch("/:projectId/promedio-interno", projectScoreController.updatePromedioInterno);

router.route("/:id")
  .get(projectScoreController.getProjectScoreById)
  .put(projectScoreController.updateProjectScore)
  .delete(projectScoreController.deleteProjectScore);

export default router;
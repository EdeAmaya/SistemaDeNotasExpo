import express from "express";
import projectScoreController from "../controllers/projectScoresController.js";

const router = express.Router();

router.route("/")
  .get(projectScoreController.getProjectScores)
  .post(projectScoreController.createProjectScore);

router.route("/:id")
  .get(projectScoreController.getProjectScoreById)
  .put(projectScoreController.updateProjectScore)
  .delete(projectScoreController.deleteProjectScore);

export default router;
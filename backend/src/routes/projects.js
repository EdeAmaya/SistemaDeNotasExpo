import express from "express";
import projectController from "../controllers/projectController.js";
const router = express.Router();

router.route("/").get(projectController.getProjects)
.post(projectController.insertProject)

router.route("/:id")
.put(projectController.updateProject)
.delete(projectController.deleteProject)

export default router;
// Rutas para la gestión de proyectos
import express from "express";
import projectController from "../controllers/projectController.js"; // Controlador
const router = express.Router();

// Rutas CRUD para proyectos
router.route("/").get(projectController.getProjects)
.post(projectController.insertProject)

// Rutas para operaciones con ID específico
router.route("/:id")
.put(projectController.updateProject)
.delete(projectController.deleteProject)

export default router;
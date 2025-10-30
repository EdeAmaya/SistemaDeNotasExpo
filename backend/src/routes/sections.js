// Rutas para la gestión de secciones
import express from "express";
import sectionController from "../controllers/sectionController.js"; // Controlador
const router = express.Router();

// Rutas CRUD para secciones
router.route("/").get(sectionController.getSections)
.post(sectionController.insertSection)

// Rutas para operaciones con ID específico
router.route("/:id")
.put(sectionController.updateSection)
.delete(sectionController.deleteSection)

export default router;
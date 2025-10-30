// Rutas para la gestión de niveles
import express from "express";
import levelController from "../controllers/levelController.js"; // Controlador
const router = express.Router();

// Rutas CRUD para niveles
router.route("/").get(levelController.getLevels)
.post(levelController.insertLevel)

// Rutas para operaciones con ID específico
router.route("/:id")
.put(levelController.updateLevel)
.delete(levelController.deleteLevel)

export default router;
// Rutas para la gestión de especialidades
import express from "express";
import specialtyController from "../controllers/specialtyController.js"; // Controlador
const router = express.Router();

// Rutas CRUD para especialidades
router.route("/").get(specialtyController.getSpecialties)
.post(specialtyController.insertSpecialty)

// Rutas para operaciones con ID específico
router.route("/:id")
.put(specialtyController.updateSpecialty)
.delete(specialtyController.deleteSpecialty)

export default router;
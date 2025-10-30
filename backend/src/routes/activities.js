// Rutas para las actividades
import express from "express";
import activityController from "../controllers/activityController.js"; // Controlador
const router = express.Router();

// Rutas CRUD para actividades
router.route("/").get(activityController.getActivities)
.post(activityController.insertActivity)

// Rutas para operaciones con ID específico
router.route("/:id")
.put(activityController.updateActivity)
.delete(activityController.deleteActivity)

export default router;
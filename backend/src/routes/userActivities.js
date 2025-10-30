// Rutas para la gestión de actividades de usuarios
import express from "express";
import userActivityController from "../controllers/userActivityController.js"; // Controlador

const router = express.Router();

// Ruta para obtener usuarios conectados
router.route("/connected-users")
    .get(userActivityController.getConnectedUsers);

// Ruta para obtener actividades recientes
router.route("/recent-activities")
    .get(userActivityController.getRecentActivities);

export default router;
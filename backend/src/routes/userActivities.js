import express from "express";
import userActivityController from "../controllers/userActivityController.js";

const router = express.Router();

// Rutas para el sistema de logs de usuarios
router.route("/connected-users").get(userActivityController.getConnectedUsers);
router.route("/recent-activities").get(userActivityController.getRecentActivities);

export default router;

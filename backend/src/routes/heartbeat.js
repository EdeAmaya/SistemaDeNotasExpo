// Rutas para la gestión de heartbeats
import express from "express";
import heartbeatController from "../controllers/heartbeatController.js"; // Controlador
import { authenticateToken } from "../middlewares/auth.js"; // Middleware de autenticación

const router = express.Router();

// Ruta para recibir heartbeats del cliente
router.post("/", authenticateToken, heartbeatController.sendHeartbeat);

export default router;
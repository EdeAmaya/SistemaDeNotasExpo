import express from "express";
import heartbeatController from "../controllers/heartbeatController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Ruta para recibir heartbeats del cliente
router.post("/", authenticateToken, heartbeatController.sendHeartbeat);

export default router;
// Rutas para la gestión de logout
import express from "express";
import logoutController from "../controllers/logoutController.js"; // Controlador

const router = express.Router();

// Ruta para logout
router.post("/", logoutController.logout);

export default router;
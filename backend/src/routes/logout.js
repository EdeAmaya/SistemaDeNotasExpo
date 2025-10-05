import express from "express";
import logoutController from "../controllers/logoutController.js";

const router = express.Router();

// Ruta para logout - Verificar que el controlador exporte correctamente
router.post("/", logoutController.logout);

export default router;
// Rutas para la gestión de login
import express from "express";
import loginController from "../controllers/loginController.js"; // Controlador

const router = express.Router();

// Ruta para login
router.route("/").post(loginController.login);

export default router;
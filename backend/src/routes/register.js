import express from "express";
import registerController from "../controllers/registerController.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Ruta para registro de usuarios
router.route("/").post(registerController.registerUser);

// Ruta para verificar usuario (solo Admin)
router.route("/verify/:id").put(requireAdmin, registerController.verifyUser);

export default router;
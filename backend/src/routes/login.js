import express from "express";
import loginController from "../controllers/loginController.js";

const router = express.Router();

// Ruta para login
router.route("/").post(loginController.login);

export default router;
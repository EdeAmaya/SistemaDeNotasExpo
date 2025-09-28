import express from "express";
import logoutController from "../controllers/logoutController.js";

const router = express.Router();

// Ruta para logout
router.route("/").post(logoutController.logout);

export default router;
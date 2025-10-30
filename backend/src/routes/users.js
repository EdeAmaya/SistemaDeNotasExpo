// Rutas para la gestión de usuarios
import express from "express";
import userController from "../controllers/userController.js";
import { requireAdmin, requireAdminOrDocente, authenticateToken } from "../middlewares/auth.js"; // Middlewares para autenticación y autorización

const router = express.Router();

// Rutas que requieren autenticación de Admin
router.route("/")
  .get(requireAdmin, userController.getUsers)  // Solo Admin puede ver todos los usuarios
  .post(requireAdmin, userController.insertUser); // Solo Admin puede crear usuarios

router.route("/check-email")
  .post(userController.checkEmailExists); // Público para registro

router.route("/role/:role")
  .get(requireAdminOrDocente, userController.getUsersByRole); // Admin y Docente pueden ver usuarios por rol

router.route("/:id")
  .get(authenticateToken, userController.getUserById) // Usuarios autenticados pueden ver perfiles
  .put(requireAdmin, userController.updateUser) // Solo Admin puede actualizar usuarios
  .delete(requireAdmin, userController.deleteUser); // Solo Admin puede eliminar usuarios

export default router;
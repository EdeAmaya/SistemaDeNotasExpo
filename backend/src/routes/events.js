// Rutas para la gestión de eventos
import express from "express";
import eventController from "../controllers/eventController.js"; // Controlador
import { requireAdmin, authenticateToken } from "../middlewares/auth.js"; // Middleware de autenticación y autorización

const router = express.Router();

// Rutas que requieren autenticación (todos pueden VER)
router.route("/")
  .get(authenticateToken, eventController.getEvents)  // Todos pueden ver eventos
  .post(requireAdmin, eventController.createEvent);   // Solo Admin puede crear

router.route("/check-availability")
  .get(authenticateToken, eventController.checkAvailability); // Todos pueden verificar

router.route("/occupied-dates")
  .get(authenticateToken, eventController.getOccupiedDates); // Todos pueden ver fechas ocupadas

router.route("/:id")
  .get(authenticateToken, eventController.getEventById)     // Todos pueden ver un evento
  .put(requireAdmin, eventController.updateEvent)           // Solo Admin puede actualizar
  .delete(requireAdmin, eventController.deleteEvent);       // Solo Admin puede eliminar

export default router;
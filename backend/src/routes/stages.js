import express from "express";
import stageController from "../controllers/stageController.js";

const router = express.Router();

// Rutas principales CRUD
router.route("/")
  .get(stageController.getStages)       // GET /api/stages - Obtener todas las etapas
  .post(stageController.insertStage);   // POST /api/stages - Crear nueva etapa

// Ruta especial para obtener la etapa actual
router.route("/current")
  .get(stageController.getCurrentStage); // GET /api/stages/current - Obtener etapa activa

// Rutas con parámetro ID
router.route("/:id")
  .get(stageController.getStageById)     // GET /api/stages/:id - Obtener etapa por ID
  .put(stageController.updateStage)      // PUT /api/stages/:id - Actualizar etapa
  .delete(stageController.deleteStage);  // DELETE /api/stages/:id - Eliminar etapa

export default router;
// Rutas para rúbricas y criterios
import express from "express";
import rubricController from "../controllers/rubricsController.js";

const router = express.Router();

// ========================
// ENDPOINTS PARA RUBRICAS
// ========================

// Obtener todas las rúbricas / Crear una o varias rúbricas
router
  .route("/")
  .get(rubricController.getRubrics)
  .post(rubricController.createRubrics);

// Obtener, actualizar o eliminar una rúbrica por ID
router
  .route("/:id")
  .get(rubricController.getRubricById)
  .put(rubricController.updateRubric)
  .delete(rubricController.deleteRubric);

// =========================
// ENDPOINTS PARA CRITERIOS
// =========================

// Obtener criterios de una rúbrica / Agregar nuevos criterios
router
  .route("/:id/criteria")
  .get(rubricController.getCriteria)
  .post(rubricController.addCriteria);

// Actualizar o eliminar un criterio específico
router
  .route("/:id/criteria/:criterionId")
  .put(rubricController.updateCriterion)
  .delete(rubricController.deleteCriterion);

export default router;

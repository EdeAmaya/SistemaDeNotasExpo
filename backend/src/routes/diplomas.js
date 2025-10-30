// Rutas para la gestión de diplomas
import express from "express";
import diplomasController from "../controllers/diplomasController.js"; // Controlador

const router = express.Router();

// Descargar diplomas por sección
router.get("/section/:sectionId", diplomasController.downloadDiplomasSection);

// Descargar diplomas de bachillerato por nivel y especialidad
router.get('/bachillerato/:levelId/:specialtyId', diplomasController.downloadDiplomasBachillerato);

// Descargar diploma individual por lugar (tercero o quinto lugar)
router.get('/bachillerato/:levelId/:specialtyId/:place', diplomasController.downloadDiplomaByPlace);

export default router;
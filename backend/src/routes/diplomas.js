import express from "express";
import diplomasController from "../controllers/diplomasController.js";

const router = express.Router();

router.get("/section/:sectionId", diplomasController.downloadDiplomasSection);

router.get('/bachillerato/:levelId/:specialtyId', diplomasController.downloadDiplomasBachillerato);

router.get('/bachillerato/:levelId/:specialtyId/:place', diplomasController.downloadDiplomaByPlace);

export default router;
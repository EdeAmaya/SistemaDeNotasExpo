import express from "express";
import diplomasController from "../controllers/diplomasController.js";

const router = express.Router();

router.get("/section/:sectionId", diplomasController.downloadDiplomasSection);

export default router;
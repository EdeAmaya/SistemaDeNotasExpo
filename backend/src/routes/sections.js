import express from "express";
import sectionController from "../controllers/sectionController.js";
const router = express.Router();

router.route("/").get(sectionController.getSections)
.post(sectionController.insertSection)

router.route("/:id")
.put(sectionController.updateSection)
.delete(sectionController.deleteSection)

export default router;
import express from "express";
import levelController from "../controllers/levelController.js";
const router = express.Router();

router.route("/").get(levelController.getLevels)
.post(levelController.insertLevel)

router.route("/:id")
.put(levelController.updateLevel)
.delete(levelController.deleteLevel)

export default router;
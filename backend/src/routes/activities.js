import express from "express";
import activityController from "../controllers/activityController.js";
const router = express.Router();

router.route("/").get(activityController.getActivities)
.post(activityController.insertActivity)

router.route("/:id")
.put(activityController.updateActivity)
.delete(activityController.deleteActivity)

export default router;
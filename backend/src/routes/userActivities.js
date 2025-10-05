import express from "express";
import userActivityController from "../controllers/userActivityController.js";

const router = express.Router();

// Ya no necesitan authenticateToken aquí porque app.js lo aplica globalmente
router.route("/connected-users")
    .get(userActivityController.getConnectedUsers);

router.route("/recent-activities")
    .get(userActivityController.getRecentActivities);

export default router;
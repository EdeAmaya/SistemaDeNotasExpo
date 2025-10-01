// backend/src/controllers/userActivityController.js
const userActivityController = {};
import ActivityLogger from "../utils/activityLogger.js";

// Obtener usuarios conectados con estado de presencia
userActivityController.getConnectedUsers = async (req, res) => {
    try {
        const hoursAgo = req.query.hours || 2;
        const connectedUsers = await ActivityLogger.getConnectedUsers(hoursAgo);
        
        const formattedUsers = connectedUsers.map(activity => ({
            _id: activity.user._id,
            name: activity.user.name,
            lastName: activity.user.lastName,
            email: activity.user.email,
            role: activity.user.role,
            lastHeartbeat: activity.lastHeartbeat,
            presenceStatus: activity.presenceStatus // ← NUEVO: Estado de presencia
        }));
        
        res.json(formattedUsers);
    } catch (error) {
        console.error('Error obteniendo usuarios conectados:', error);
        res.status(500).json({ 
            message: "Error al obtener usuarios conectados",
            error: error.message 
        });
    }
};

// Obtener actividades recientes con filtro por rol del usuario
userActivityController.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const userRole = req.user.role;
        
        const activities = await ActivityLogger.getRecentActivitiesByRole(userRole, limit);
        
        const formattedActivities = activities.map(activity => ({
            _id: activity._id,
            action: activity.action,
            actionDescription: activity.actionDescription,
            targetModel: activity.targetModel,
            targetId: activity.targetId,
            metadata: activity.metadata,
            createdAt: activity.createdAt,
            user: {
                _id: activity.user._id,
                name: activity.user.name,
                lastName: activity.user.lastName,
                email: activity.user.email,
                role: activity.user.role
            }
        }));
        
        res.json(formattedActivities);
    } catch (error) {
        console.error('Error obteniendo actividades recientes:', error);
        res.status(500).json({ 
            message: "Error al obtener actividades recientes",
            error: error.message 
        });
    }
};

export default userActivityController;
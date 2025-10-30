// backend/src/controllers/userActivityController.js
const userActivityController = {};
import ActivityLogger from "../utils/activityLogger.js"; // Importar el logger de actividad

// Obtener usuarios conectados con estado de presencia
userActivityController.getConnectedUsers = async (req, res) => {
    try {
        // Obtener usuarios con actividad reciente
        const hoursAgo = req.query.hours || 2;
        const connectedUsers = await ActivityLogger.getConnectedUsers(hoursAgo);
        
        // Formatear la respuesta
        const formattedUsers = connectedUsers.map(activity => ({
            _id: activity.user._id,
            name: activity.user.name,
            lastName: activity.user.lastName,
            email: activity.user.email,
            role: activity.user.role,
            lastHeartbeat: activity.lastHeartbeat,
            presenceStatus: activity.presenceStatus 
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
        
        // Obtener actividades recientes filtradas por rol
        const activities = await ActivityLogger.getRecentActivitiesByRole(userRole, limit);
        
        // Formatear la respuesta
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
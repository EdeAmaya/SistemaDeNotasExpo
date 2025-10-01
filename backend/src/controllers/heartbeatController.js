import ActivityLogger from "../utils/activityLogger.js";

const heartbeatController = {};

// Recibir heartbeat del cliente
heartbeatController.sendHeartbeat = async (req, res) => {
    try {
        const { isActive } = req.body; // El cliente envía si está activo o ausente
        const userId = req.user._id;
        
        await ActivityLogger.heartbeat(userId, isActive, req);
        
        res.status(200).json({
            success: true,
            message: 'Heartbeat recibido',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error procesando heartbeat:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando heartbeat'
        });
    }
};

export default heartbeatController;
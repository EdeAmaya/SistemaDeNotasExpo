// Modelo para registrar logs de actividad de usuarios
import {Schema, model} from "mongoose";

const activityLogSchema = new Schema({
    userId: { // Referencia al usuario que realizó la acción
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    action: { // Tipo de acción realizada
        type: String,
        required: true,
        enum: [
            'CREATE_PROJECT',
            'UPDATE_PROJECT', 
            'DELETE_PROJECT',
            'CREATE_STUDENT',
            'UPDATE_STUDENT',
            'DELETE_STUDENT',
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',
            'CREATE_STAGE',
            'UPDATE_STAGE',
            'DELETE_STAGE',
            'LOGIN',
            'LOGOUT',
            'HEARTBEAT' // Presencia activa
        ]
    },
    
    actionDescription: { // Descripción detallada de la acción
        type: String,
        required: true
    },
    
    targetModel: { // Modelo objetivo de la acción
        type: String,
        enum: ['Project', 'Student', 'User', 'Stage', 'Auth', 'Presence'] // Presencia
    },
    
    targetId: { // ID del documento objetivo
        type: Schema.Types.ObjectId
    },
    
    metadata: { // Información adicional relevante
        type: Schema.Types.Mixed
    },
    
    ipAddress: { // Dirección IP del usuario
        type: String
    },
    
    userAgent: { // Información del agente de usuario (navegador, SO, etc.)
        type: String
    },
    
    // Campos para presencia
    lastHeartbeat: { // Última actividad registrada
        type: Date,
        default: Date.now
    },
    
    isActive: { // Estado de presencia del usuario
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

// Índices para optimizar consultas
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, lastHeartbeat: -1 }); // Para consultas de presencia

export default model("ActivityLog", activityLogSchema);
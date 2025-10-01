import {Schema, model} from "mongoose";

const activityLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    action: {
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
            'HEARTBEAT' // ← NUEVO: Para mantener presencia activa
        ]
    },
    
    actionDescription: {
        type: String,
        required: true
    },
    
    targetModel: {
        type: String,
        enum: ['Project', 'Student', 'User', 'Stage', 'Auth', 'Presence'] // ← NUEVO: Presence
    },
    
    targetId: {
        type: Schema.Types.ObjectId
    },
    
    metadata: {
        type: Schema.Types.Mixed
    },
    
    ipAddress: {
        type: String
    },
    
    userAgent: {
        type: String
    },
    
    // ← NUEVO: Campos para presencia
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    
    isActive: {
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
activityLogSchema.index({ userId: 1, lastHeartbeat: -1 }); // ← NUEVO: Para consultas de presencia

export default model("ActivityLog", activityLogSchema);
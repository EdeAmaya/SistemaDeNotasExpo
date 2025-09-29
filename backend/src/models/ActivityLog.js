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
            'LOGOUT'
        ]
    },
    
    actionDescription: {
        type: String,
        required: true
    },
    
    targetModel: {
        type: String,
        enum: ['Project', 'Student', 'User', 'Stage', 'Auth']
    },
    
    targetId: {
        type: Schema.Types.ObjectId
    },
    
    metadata: {
        type: Schema.Types.Mixed // Para datos adicionales
    },
    
    ipAddress: {
        type: String
    },
    
    userAgent: {
        type: String
    }

}, {
    timestamps: true
});

// Índices para optimizar consultas
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

export default model("ActivityLog", activityLogSchema);
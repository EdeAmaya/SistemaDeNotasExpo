import ActivityLog from "../models/ActivityLog.js";

const ActivityLogger = {
    // Registrar actividad
    log: async (userId, action, description, targetModel = null, targetId = null, metadata = {}, req = null) => {
        try {
            const logEntry = new ActivityLog({
                userId,
                action,
                actionDescription: description,
                targetModel,
                targetId,
                metadata,
                ipAddress: req?.ip || req?.connection?.remoteAddress,
                userAgent: req?.get('User-Agent'),
                lastHeartbeat: new Date(),
                isActive: true
            });
            
            await logEntry.save();
            console.log(`Log registrado: ${description} - Usuario: ${userId}`);
        } catch (error) {
            console.error('Error registrando actividad:', error);
        }
    },

    // ← NUEVO: Registrar heartbeat (señal de vida)
    heartbeat: async (userId, isUserActive = true, req = null) => {
        try {
            // Buscar el último heartbeat del usuario
            let heartbeat = await ActivityLog.findOne({
                userId,
                action: 'HEARTBEAT'
            }).sort({ lastHeartbeat: -1 });

            if (heartbeat) {
                // Actualizar heartbeat existente
                heartbeat.lastHeartbeat = new Date();
                heartbeat.isActive = isUserActive;
                await heartbeat.save();
            } else {
                // Crear nuevo heartbeat
                const logEntry = new ActivityLog({
                    userId,
                    action: 'HEARTBEAT',
                    actionDescription: 'Usuario conectado',
                    targetModel: 'Presence',
                    lastHeartbeat: new Date(),
                    isActive: isUserActive,
                    ipAddress: req?.ip || req?.connection?.remoteAddress,
                    userAgent: req?.get('User-Agent')
                });
                await logEntry.save();
            }
        } catch (error) {
            console.error('Error registrando heartbeat:', error);
        }
    },

    // Obtener actividades recientes de un usuario
    getUserRecentActivity: async (userId, limit = 1) => {
        try {
            return await ActivityLog
                .findOne({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            console.error('Error obteniendo actividad del usuario:', error);
            return null;
        }
    },

    // Obtener todas las actividades recientes
    getRecentActivities: async (limit = 50) => {
        try {
            return await ActivityLog
                .find()
                .populate('userId', 'name lastName email role')
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            console.error('Error obteniendo actividades:', error);
            return [];
        }
    },

    // ← ACTUALIZADO: Obtener usuarios conectados con estado de presencia
    getConnectedUsers: async (hoursAgo = 2) => {
        try {
            const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            
            const activities = await ActivityLog.aggregate([
                {
                    $match: {
                        lastHeartbeat: { $gte: timeThreshold },
                        action: { $in: ['LOGIN', 'HEARTBEAT'] }
                    }
                },
                {
                    $sort: { lastHeartbeat: -1 }
                },
                {
                    $group: {
                        _id: '$userId',
                        lastHeartbeat: { $first: '$lastHeartbeat' },
                        isActive: { $first: '$isActive' },
                        action: { $first: '$action' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        'user.isVerified': true,
                        'user.role': { $in: ['Docente', 'Evaluador', 'Estudiante'] }
                    }
                },
                {
                    $project: {
                        user: 1,
                        lastHeartbeat: 1,
                        isActive: 1,
                        // Calcular estado de presencia
                        presenceStatus: {
                            $cond: {
                                if: {
                                    $gte: [
                                        '$lastHeartbeat',
                                        new Date(Date.now() - 60 * 1000) // Últimos 60 segundos
                                    ]
                                },
                                then: {
                                    $cond: {
                                        if: '$isActive',
                                        then: 'online', // Verde: activo y reciente
                                        else: 'away'    // Naranja: inactivo pero conectado
                                    }
                                },
                                else: 'offline' // Gris: sin heartbeat reciente
                            }
                        }
                    }
                },
                {
                    $sort: { lastHeartbeat: -1 }
                },
                {
                    $limit: 8
                }
            ]);
            
            return activities;
        } catch (error) {
            console.error('Error obteniendo usuarios conectados:', error);
            return [];
        }
    },

    // Obtener actividades recientes con filtro por rol
    getRecentActivitiesByRole: async (userRole, limit = 10) => {
        try {
            let matchCondition = {
                action: { $ne: 'HEARTBEAT' } // ← ACTUALIZADO: Excluir heartbeats de actividades
            };

            if (userRole === 'Admin') {
                matchCondition = {
                    action: { $nin: ['LOGIN', 'HEARTBEAT'] }
                };
            } else {
                matchCondition = {
                    action: { $nin: ['LOGIN', 'HEARTBEAT'] }
                };
            }

            const activities = await ActivityLog.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        ...matchCondition,
                        'user.isVerified': true,
                        'user.role': userRole === 'Admin' 
                            ? { $in: ['Admin', 'Docente', 'Evaluador'] }
                            : { $in: ['Docente', 'Evaluador'] }
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 1,
                        action: 1,
                        actionDescription: 1,
                        targetModel: 1,
                        targetId: 1,
                        metadata: 1,
                        createdAt: 1,
                        'user._id': 1,
                        'user.name': 1,
                        'user.lastName': 1,
                        'user.email': 1,
                        'user.role': 1
                    }
                }
            ]);
            
            return activities;
        } catch (error) {
            console.error('Error obteniendo actividades por rol:', error);
            return [];
        }
    }
};

export default ActivityLogger;
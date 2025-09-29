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
                userAgent: req?.get('User-Agent')
            });
            
            await logEntry.save();
            console.log(`📝 Log registrado: ${description} - Usuario: ${userId}`);
        } catch (error) {
            console.error('❌ Error registrando actividad:', error);
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

    // NUEVO: Obtener usuarios activos (conectados recientemente)
    getConnectedUsers: async (hoursAgo = 2) => {
        try {
            const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            
            const activities = await ActivityLog.aggregate([
                {
                    $match: {
                        createdAt: { $gte: timeThreshold },
                        action: 'LOGIN' // Solo logins para determinar conectados
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        lastLoginTime: { $last: '$createdAt' }
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
                        'user.role': { $in: ['Docente', 'Evaluador'] } // Sin admins en conectados
                    }
                },
                {
                    $sort: { lastLoginTime: -1 }
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

    // NUEVO: Obtener actividades recientes con filtro por rol
    getRecentActivitiesByRole: async (userRole, limit = 10) => {
        try {
            let matchCondition = {
                action: { $ne: 'LOGIN' } // Excluir logins de actividades
            };

            // Si es admin, incluir actividades de admins
            if (userRole === 'Admin') {
                // Admin ve todas las actividades (incluyendo las suyas)
                matchCondition = {
                    action: { $ne: 'LOGIN' }
                };
            } else {
                // Otros roles solo ven actividades de Docentes y Evaluadores
                matchCondition = {
                    action: { $ne: 'LOGIN' }
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
                            ? { $in: ['Admin', 'Docente', 'Evaluador'] } // Admin ve todo
                            : { $in: ['Docente', 'Evaluador'] } // Otros no ven admin
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
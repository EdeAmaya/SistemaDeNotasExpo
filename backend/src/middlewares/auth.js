import jwt from 'jsonwebtoken'; // Manejo de token
import userModel from '../models/User.js'; // Modelo de usuario
import { config } from '../config.js'; // Configuración

// Middleware principal de autenticación
export const authenticateToken = async (req, res, next) => {
  try {    
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, config.JWT.secret);
    
    // Si es admin, no buscar en la base de datos
    if (decoded.id === "Admin") {
      req.user = {
        _id: "Admin",
        email: config.emailAdmin.email,
        userType: "Admin",
        role: "Admin"
      };
      return next();
    }
    
    // Buscar el usuario en la base de datos
    const user = await userModel.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Usuario no verificado' });
    }

    // Adjuntar la información del usuario a la request
    req.user = {
      ...user.toObject(),
      userType: user.role
    };
    
    next();
  } catch (error) {    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expirado' });
    }
    
    return res.status(403).json({ message: 'Error de autenticación' });
  }
};

// Middleware para validar roles específicos - CORREGIDO
export const validateAuthToken = (allowedUserTypes = []) => {
  return async (req, res, next) => {
    try {
      // Primero autenticar el token
      await authenticateToken(req, res, () => {
        // Una vez autenticado, verificar el rol
        if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(req.user.userType)) {
          return res.status(403).json({ message: "Acceso denegado. Rol insuficiente." });
        }

        next();
      });
    } catch (error) {
      return res.status(403).json({ message: "Error de validación" });
    }
  };
};

// Middleware específico para solo Admin
export const requireAdmin = validateAuthToken(['Admin']);

// Middleware para Admin y Docente
export const requireAdminOrDocente = validateAuthToken(['Admin', 'Docente']);

// Middleware para Admin y Evaluador
export const requireAdminOrEvaluador = validateAuthToken(['Admin', 'Evaluador']);

// Middleware para usuarios verificados (cualquier rol)
export const requireVerified = authenticateToken;

// Alias para compatibilidad
export const verifyAuth = authenticateToken;
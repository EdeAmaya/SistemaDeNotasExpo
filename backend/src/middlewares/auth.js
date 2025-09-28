import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';
import { config } from '../config.js';

// Middleware principal de autenticación
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔍 Verificando autenticación...');
    console.log('Cookies recibidas:', req.cookies);
    console.log('Headers:', req.headers);
    
    const token = req.cookies.authToken;
    
    if (!token) {
      console.log('❌ No se encontró token en las cookies');
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    console.log('✅ Token encontrado:', token.substring(0, 50) + '...');

    const decoded = jwt.verify(token, config.JWT.secret);
    console.log('✅ Token decodificado:', decoded);
    
    // Si es admin, no buscar en la base de datos
    if (decoded.id === "Admin") {
      req.user = {
        _id: "Admin",
        email: config.emailAdmin.email,
        userType: "Admin",
        role: "Admin"
      };
      console.log('✅ Usuario Admin autenticado');
      return next();
    }
    
    // Buscar el usuario en la base de datos
    const user = await userModel.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ Usuario no encontrado en BD:', decoded.id);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      console.log('❌ Usuario no verificado:', user.email);
      return res.status(403).json({ message: 'Usuario no verificado' });
    }

    // Adjuntar la información del usuario a la request
    req.user = {
      ...user.toObject(),
      userType: user.role
    };
    
    console.log('✅ Usuario autenticado:', user.email, 'Rol:', user.role);
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expirado' });
    }
    
    return res.status(403).json({ message: 'Error de autenticación' });
  }
};

// Middleware para validar roles específicos
export const validateAuthToken = (allowedUserTypes = []) => {
  return async (req, res, next) => {
    try {
      // Primero autenticar el token
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Luego verificar el rol
      if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(req.user.userType)) {
        console.log('❌ Rol insuficiente. Usuario:', req.user.userType, 'Requerido:', allowedUserTypes);
        return res.status(403).json({ message: "Acceso denegado. Rol insuficiente." });
      }

      console.log('✅ Rol verificado:', req.user.userType);
      next();
    } catch (error) {
      console.error("❌ Error en validación de token:", error);
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
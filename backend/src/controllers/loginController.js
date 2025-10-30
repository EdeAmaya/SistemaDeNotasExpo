import userModel from "../models/User.js"; // Modelo de usuario
import bcryptjs from "bcryptjs"; // Para comparar contraseñas
import jsonwebtoken from "jsonwebtoken"; // Para generar tokens JWT
import { config } from "../config.js"; // Configuración

const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound; // Variable para almacenar el usuario encontrado
    let userType; // Variable para almacenar el tipo de usuario

    // Validación robusta de emailAdmin
    if (!config.emailAdmin || !config.emailAdmin.email || !config.emailAdmin.password) {
      return res.status(500).json({ message: "Configuración de emailAdmin incompleta en config.js" });
    }

    // Verificar si es Admin usando credenciales de config
    if (email === config.emailAdmin.email && password === config.emailAdmin.password) {
      userType = "Admin";
      userFound = { _id: "Admin" };
    } else {
      // Buscar usuario en la base de datos
      userFound = await userModel.findOne({ email: email });
      if (userFound) {
        userType = userFound.role;
      }
    }

    if (!userFound) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario no está verificado (excepto Admin)
    if (userType !== "Admin" && userFound.isVerified === false) {
      return res.status(401).json({ 
        message: "Cuenta no verificada. Contacta al administrador para verificar tu cuenta.",
        needVerification: true 
      });
    }

    // Verificar contraseña (solo para usuarios de la BD, no para Admin)
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña inválida" });
      }
    }

    // Generar JWT token
    const token = jsonwebtoken.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // CONFIGURACIÓN DE COOKIE PARA PRODUCCIÓN
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Opciones de la cookie
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // TRUE en producción (HTTPS)
      sameSite: isProduction ? 'none' : 'lax', // 'none' en producción para cross-site
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/', // Disponible en toda la app
      domain: isProduction ? undefined : undefined // Sin domain específico
    };

    // Establecer la cookie
    res.cookie("authToken", token, cookieOptions);

    // Formatear información del usuario para enviar al frontend
    let userData = null;
    
    if (userType === "Admin") {
      userData = {
        id: "Admin",
        name: "Administrador",
        lastName: "Sistema",
        email: config.emailAdmin.email,
        role: "Admin",
        isVerified: true
      };
    } else {
      // Usuarios regulares (Estudiante, Docente, Evaluador)
      userData = {
        id: userFound._id,
        name: userFound.name,
        lastName: userFound.lastName,
        email: userFound.email,
        role: userFound.role,
        isVerified: userFound.isVerified,
        createdAt: userFound.createdAt
      };
    }

    res.json({
      message: "Login exitoso",
      userType,
      user: userData
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default loginController;
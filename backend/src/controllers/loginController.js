import userModel from "../models/User.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔐 Intento de login para:', email);
    console.log('🌍 Origin:', req.headers.origin);
    console.log('🍪 Cookies recibidas en login:', req.cookies);

    let userFound;
    let userType;

    // Validación robusta de emailAdmin
    if (!config.emailAdmin || !config.emailAdmin.email || !config.emailAdmin.password) {
      return res.status(500).json({ message: "Configuración de emailAdmin incompleta en config.js" });
    }

    // Verificar si es Admin usando credenciales de config
    if (email === config.emailAdmin.email && password === config.emailAdmin.password) {
      userType = "Admin";
      userFound = { _id: "Admin" };
      console.log('👑 Login como Admin');
    } else {
      // Buscar usuario en la base de datos
      userFound = await userModel.findOne({ email: email });
      if (userFound) {
        userType = userFound.role;
        console.log('👤 Usuario encontrado:', email, 'Rol:', userType);
      }
    }

    if (!userFound) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario no está verificado (excepto Admin)
    if (userType !== "Admin" && userFound.isVerified === false) {
      console.log('⚠️ Usuario no verificado:', email);
      return res.status(401).json({ 
        message: "Cuenta no verificada. Contacta al administrador para verificar tu cuenta.",
        needVerification: true 
      });
    }

    // Verificar contraseña (solo para usuarios de la BD, no para Admin)
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        console.log('❌ Contraseña incorrecta para:', email);
        return res.status(401).json({ message: "Contraseña inválida" });
      }
    }

    // Generar JWT token
    const token = jsonwebtoken.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    console.log('🎫 Token generado:', token.substring(0, 50) + '...');

    // CONFIGURACIÓN DE COOKIE MUY ESPECÍFICA
    const cookieOptions = {
      httpOnly: true,
      secure: false, // FALSE para desarrollo local
      sameSite: 'lax', // LAX para desarrollo local
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/', // Disponible en toda la app
      domain: undefined // No especificar dominio para localhost
    };

    console.log('🍪 Configuración de cookie:', cookieOptions);

    // Establecer la cookie
    res.cookie("authToken", token, cookieOptions);

    // Verificar que la cookie se estableció
    console.log('🍪 Cookie establecida en headers:', res.getHeaders()['set-cookie']);

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

    console.log('✅ Login exitoso para:', userData.email, 'Rol:', userType);

    res.json({
      message: "Login exitoso",
      userType,
      user: userData
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default loginController;
import userModel from "../models/User.js";
import bcryptjs from "bcryptjs";

const registerController = {};

registerController.registerUser = async (req, res) => {
  try {
    const { name, lastName, email, password, role } = req.body;

    // Validaciones básicas
    if (!name || !lastName || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }

    // Validar que el rol sea válido
    const validRoles = ['Admin', 'Estudiante', 'Docente', 'Evaluador'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Rol inválido. Roles permitidos: " + validRoles.join(', ') 
      });
    }

    // Verificar si el email ya existe
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "El correo electrónico ya está registrado" 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Formato de correo electrónico inválido" 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Validar longitud de nombre y apellido
    if (name.length > 100 || lastName.length > 100) {
      return res.status(400).json({ 
        message: "El nombre y apellido no pueden exceder 100 caracteres" 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Crear nuevo usuario
    const newUser = new userModel({
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: false // Por defecto, los usuarios deben ser verificados por un admin
    });

    // Guardar usuario
    await newUser.save();

    // Respuesta exitosa (sin incluir la contraseña)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: "Usuario registrado exitosamente. Esperando verificación del administrador.",
      user: userResponse
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "El correo electrónico ya está en uso" 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor al registrar usuario" 
    });
  }
};

// Método para verificar usuario (solo Admin)
registerController.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const user = await userModel.findByIdAndUpdate(
      id, 
      { isVerified }, 
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ 
        message: "Usuario no encontrado" 
      });
    }

    res.json({
      message: `Usuario ${isVerified ? 'verificado' : 'no verificado'} exitosamente`,
      user
    });

  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({ 
      message: "Error al verificar usuario" 
    });
  }
};

export default registerController;
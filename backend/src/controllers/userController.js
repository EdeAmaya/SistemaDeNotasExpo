import userModel from "../models/User.js";
import bcryptjs from "bcryptjs";

const userController = {};

// Select - Get all users (sin contraseñas)
userController.getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// Select - Get user by ID
userController.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(400).json({ message: "ID inválido o error en la consulta" });
  }
};

// Insert - Create new user (mejorado)
userController.insertUser = async (req, res) => {
  try {
    const { name, lastName, email, password, role, isVerified } = req.body;

    // Validaciones básicas
    if (!name || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar si el email ya existe
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new userModel({
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: isVerified || false
    });

    await newUser.save();

    // Respuesta sin contraseña
    const userResponse = await userModel.findById(newUser._id).select('-password');
    
    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: userResponse
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está en uso" });
    }
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    res.status(500).json({ message: "Error al crear usuario", error: error.message });
  }
};

// Delete user
userController.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
};

// Update user (mejorado)
userController.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, lastName, email, password, role, isVerified } = req.body;

    // Buscar usuario actual
    const currentUser = await userModel.findById(id);
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Preparar datos de actualización
    let updateData = {
      name: name?.trim() || currentUser.name,
      lastName: lastName?.trim() || currentUser.lastName,
      role: role || currentUser.role,
      isVerified: isVerified !== undefined ? isVerified : currentUser.isVerified
    };

    // Verificar si el email cambió y si ya existe
    if (email && email !== currentUser.email) {
      const existsEmail = await userModel.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: id } 
      });
      if (existsEmail) {
        return res.status(400).json({ message: "El correo ya está en uso por otro usuario" });
      }
      updateData.email = email.toLowerCase().trim();
    }

    // Solo actualizar contraseña si se proporciona
    if (password && password.trim()) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    // Actualizar usuario
    const updatedUser = await userModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, select: '-password' }
    );

    res.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está en uso" });
    }
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
  }
};

// Get users by role
userController.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['Admin', 'Estudiante', 'Docente', 'Evaluador'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Rol inválido. Roles válidos: " + validRoles.join(', ') 
      });
    }

    const users = await userModel.find({ role }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ message: "Error al obtener usuarios por rol" });
  }
};

// Check if email exists
userController.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email es requerido" });
    }

    const exists = await userModel.findOne({ email: email.toLowerCase().trim() });
    res.json({ exists: !!exists });
  } catch (error) {
    console.error('Error al verificar email:', error);
    res.status(500).json({ message: "Error al verificar el correo" });
  }
};

export default userController;
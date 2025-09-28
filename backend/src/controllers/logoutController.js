const logoutController = {};

logoutController.logout = async (req, res) => {
  try {
    // Limpiar la cookie del token de autenticación
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Respuesta exitosa
    return res.status(200).json({ 
      message: "Sesión cerrada exitosamente" 
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ 
      message: "Error al cerrar sesión" 
    });
  }
};

export default logoutController;
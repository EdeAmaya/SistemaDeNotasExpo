const logoutController = {};

logoutController.logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Limpiar la cookie del token de autenticación
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    console.log('✅ Sesión cerrada exitosamente');

    // Respuesta exitosa
    return res.status(200).json({ 
      message: "Sesión cerrada exitosamente" 
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    return res.status(500).json({ 
      message: "Error al cerrar sesión" 
    });
  }
};

// IMPORTANTE: Exportar el controlador completo
export default logoutController;
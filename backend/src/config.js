// Archivo de configuración para la aplicación
import dotenv from "dotenv";

dotenv.config();

export const config ={
    db:{
        URI:process.env.DB_URI, // Cadena de conexión a la base de datos
    },

    server:{
        port:process.env.PORT, // Puerto del servidor
    },

    JWT:{
        secret:process.env.JWT_SECRET, // Secreto para firmar JWT
        expiresIn:process.env.JWT_EXPIRES, // Tiempo de expiración de JWT

    },

    // Credenciales de respaldo, para iniciar sesión como administrador
    emailAdmin:{
        email:process.env.ADMIN_EMAIL, // Email del administrador
        password:process.env.ADMIN_PASSWORD, // Contraseña del administrador
    },
};
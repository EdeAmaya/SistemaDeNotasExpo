import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Importar rutas de autenticación
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import registerRoutes from "./src/routes/register.js";

// Importar rutas existentes
import usersRoutes from "./src/routes/users.js";
import levelsRoutes from "./src/routes/levels.js";
import sectionsRoutes from "./src/routes/sections.js";
import specialtiesRoutes from "./src/routes/specialties.js";
import studentsRoutes from "./src/routes/students.js";
import projectsRoutes from "./src/routes/projects.js";
import activitiesRoutes from "./src/routes/activities.js";
import stagesRoutes from "./src/routes/stages.js";
import userActivitiesRoutes from "./src/routes/userActivities.js";

// Importar middlewares
import { authenticateToken } from "./src/middlewares/auth.js";

const app = express();

// CONFIGURACIÓN CORS MUY ESPECÍFICA PARA COOKIES
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Origin no permitido:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // CRÍTICO: Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cookie'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Para legacy browsers
};

app.use(cors(corsOptions));

// IMPORTANTE: cookieParser debe ir después de CORS
app.use(cookieParser());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.cookies);
  next();
});

// Rutas de autenticación (públicas)
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/register", registerRoutes);

// Rutas protegidas (requieren autenticación)
app.use("/api/users", usersRoutes);
app.use("/api/levels", authenticateToken, levelsRoutes);
app.use("/api/sections", authenticateToken, sectionsRoutes);
app.use("/api/specialties", authenticateToken, specialtiesRoutes);
app.use("/api/students", authenticateToken, studentsRoutes);
app.use("/api/projects", authenticateToken, projectsRoutes);
app.use("/api/activities", authenticateToken, activitiesRoutes);
app.use("/api/stages", authenticateToken, stagesRoutes);
app.use("/api/user-activities", authenticateToken, userActivitiesRoutes);

// Ruta de verificación de estado de autenticación
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role || req.user.userType,
      isVerified: req.user.isVerified
    }
  });
});

// Ruta de prueba PÚBLICA (sin autenticación)
app.get("/api/test", (req, res) => {
  console.log('🧪 Test endpoint alcanzado');
  console.log('🍪 Cookies en test:', req.cookies);
  res.json({ 
    message: "API del sistema de notas funcionando correctamente",
    timestamp: new Date().toISOString(),
    cookies: req.cookies
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
});

export default app;
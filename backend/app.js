import express from "express";
import usersRoutes from "./src/routes/users.js"
import levelsRoutes from "./src/routes/levels.js"
import sectionsRoutes from "./src/routes/sections.js"
import specialtiesRoutes from "./src/routes/specialties.js"
import studentsRoutes from "./src/routes/students.js"
import projectsRoutes from "./src/routes/projects.js"
import activitiesRoutes from "./src/routes/activities.js"
import cookieParser from "cookie-parser";
import { validateAuthToken } from "./src/middlewares/validateAuthToken.js";
import cors from "cors";

const app = express();

app.use(
    cors({
      origin: "http://localhost:5173", // Dominio del cliente
      credentials: true, // Permitir envío de cookies y credenciales
    })
  );

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", usersRoutes);
app.use("/api/levels", levelsRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/specialties", specialtiesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/activities", activitiesRoutes);

export default app;
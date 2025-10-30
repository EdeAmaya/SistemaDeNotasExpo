// Rutas para la gestión de estudiantes
import express from "express";
import studentController from "../controllers/studentController.js"; // Controlador

const router = express.Router();

// Rutas para inserción masiva de  estudiantes
router.route('/students/bulk')
    .post(studentController.bulkInsertStudents);

// Ruta para eliminar todos los estudiantes
router.route('/students/delete-all')
    .delete(studentController.deleteAllStudents);

// Rutas CRUD para estudiantes
router.route("/")
    .get(studentController.getStudents)
    .post(studentController.insertStudent)

// Rutas para operaciones con ID específico
router.route("/:id")
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent)

export default router;
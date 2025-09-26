import express from "express";
import studentController from "../controllers/studentController.js";
const router = express.Router();

router.route("/").get(studentController.getStudents)
.post(studentController.insertStudent)

router.route("/:id")
.put(studentController.updateStudent)
.delete(studentController.deleteStudent)

export default router;
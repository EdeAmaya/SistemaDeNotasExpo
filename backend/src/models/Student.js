// Modelo para gestionar los estudiantes
import {Schema, model} from "mongoose";

const studentSchema = new Schema({
    studentCode: { // Código único del estudiante
        type: Number,
        required: true,
        unique: true 
    },

    name: { // Nombre del estudiante
        type: String,
        required: true
    },

    lastName: { // Apellido del estudiante
        type: String,
        required: true
    },

    idLevel: { // Nivel educativo del estudiante
        type: Schema.Types.ObjectId,
        ref: "Level",
        required: true
    },

    idSection: { // Sección del estudiante
        type: Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },

    idSpecialty: { // Especialidad del estudiante (si aplica)
        type: Schema.Types.ObjectId,
        ref: "Specialty"
    },

    projectId: { // Proyecto asignado al estudiante
        type: Schema.Types.ObjectId,
        ref: "Project"
    }

}, {
    timestamps: true, // Crea campos createdAt y updatedAt automáticamente
    strict: false
});

export default model("Student", studentSchema);
// Modelo para gestionar Proyectos
import {Schema, model} from "mongoose";

const projectSchema = new Schema({
    projectId: { // Identificador único del proyecto
        type: String,
        required: true,
        maxLength: 7,
        unique: true,
        trim: true
    },

    projectName: { // Nombre del proyecto
        type: String,
        required: true,
        trim: true
    },

    googleSitesLink: { // Enlace al sitio de Google Sites del proyecto
        type: String,
        trim: true
    },

    idLevel: { // Nivel educativo del proyecto
        type: Schema.Types.ObjectId,
        ref: "Level",
        required: true
    },

    idSection: { // Sección del proyecto
        type: Schema.Types.ObjectId,
        ref: "Section",
        // No es required porque en bachillerato puede ser null
    },

    // NUEVO: Campo para especialidad (bachillerato)
    selectedSpecialty: {
        type: Schema.Types.ObjectId,
        ref: "Specialty",
        // No es required porque en básica puede ser null
    },

    teamNumber: { // Número de equipo del proyecto
        type: Number,
        required: true,
        min: 1,
        max: 99
    },

    assignedStudents: [{ // Estudiantes asignados al proyecto
        type: Schema.Types.ObjectId,
        ref: "Student"
    }],

    status: { // Estado del proyecto
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Project", projectSchema);
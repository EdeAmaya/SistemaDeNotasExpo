import {Schema, model} from "mongoose";

const projectSchema = new Schema({
    projectId: {
        type: String,
        required: true,
        maxLength: 7,
        unique: true,
        trim: true
    },

    projectName: {
        type: String,
        required: true,
        trim: true
    },

    googleSitesLink: {
        type: String,
        trim: true
    },

    idLevel: {
        type: Schema.Types.ObjectId,
        ref: "Level",
        required: true
    },

    idSection: {
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

    teamNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 99
    },

    assignedStudents: [{
        type: Schema.Types.ObjectId,
        ref: "Student"
    }],

    status: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Project", projectSchema);
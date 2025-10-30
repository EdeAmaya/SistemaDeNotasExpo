// Modelo para gestionar las especialidades
import {Schema, model} from "mongoose";

const specialtySchema = new Schema({
    specialtyName: { // Nombre de la especialidad
        type: String,
        require: true
    },

    letterSpecialty: { // Letra de la especialidad (A, B, C, etc.) Para los sites
        type: String
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Specialty", specialtySchema);
// Modelo para gestionar Niveles educativos (Grados)
import {Schema, model} from "mongoose";

const levelSchema = new Schema({
    levelName: { // Nombre del nivel educativo
        type: String,
        require: true
    },

    letterLevel: { // Letra del nivel educativo (A, B, C, etc.) Para los sites
        type: String
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Level", levelSchema);
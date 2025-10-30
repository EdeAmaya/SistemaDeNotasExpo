// Modelo para registrar actividiad dentro del sitio
import {Schema, model} from "mongoose";

const activitySchema = new Schema({
    title: { // Título de la actividad
        type: String,
        require: true
    },

    startDate: { // Fecha de inicio
        type: Date,
        require: true
    },

    endDate: { // Fecha de fin
        type: Date,
        require: true
    }

}, {
    timestamps: true, // Crear campos createdAt y updatedAt
    strict: false
});

export default model("Activity", activitySchema);
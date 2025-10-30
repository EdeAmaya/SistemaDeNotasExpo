// Modelo para gestionar las secciones
import {Schema, model} from "mongoose";

const sectionSchema = new Schema({
    sectionName: { // Nombre de la sección
        type: String,
        require: true
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Section", sectionSchema);
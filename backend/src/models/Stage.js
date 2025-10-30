// Modelo para gestionar las etapas: Anteproyecto, 30%, etc.
import {Schema, model} from "mongoose";

const stageSchema = new Schema({
    percentage: { // Porcentaje de la etapa (ejemplo: "30%")
        type: String,
        required: [true, 'El porcentaje de etapa es requerido'],
        trim: true,
        
    },

    startDate: { // Fecha de inicio
        type: Date,
        required: [true, 'La fecha de inicio es requerida']
    },

    endDate: { // Fecha de fin
        type: Date,
        required: [true, 'La fecha de fin es requerida'],
    },

    // Campos adicionales
    name: { // Nombre de la etapa
        type: String,
        required: [true, 'El nombre de la etapa es requerido'],
        trim: true,
        maxLength: [100, 'El nombre no puede exceder 100 caracteres']
    },

    description: { // Descripción de la etapa
        type: String,
        trim: true,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres']
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // Para ordenar las etapas - REMOVIDO unique: true
    order: {
        type: Number,
        required: true,
        min: 1
        // Ya no tiene unique: true para evitar conflictos
    }

}, {
    timestamps: true,
    strict: false
});

// Índices para mejorar rendimiento
stageSchema.index({ isActive: 1 });
stageSchema.index({ order: 1 });
stageSchema.index({ startDate: 1, endDate: 1 });

// Método virtual para verificar si la etapa está activa por fechas
stageSchema.virtual('isCurrentStage').get(function() {
    const now = new Date();
    return this.startDate <= now && now <= this.endDate && this.isActive;
});

// Método virtual para verificar si la etapa está completada
stageSchema.virtual('isCompleted').get(function() {
    const now = new Date();
    return now > this.endDate;
});

// Método virtual para verificar si la etapa está próxima
stageSchema.virtual('isUpcoming').get(function() {
    const now = new Date();
    return now < this.startDate;
});

export default model("Stage", stageSchema);
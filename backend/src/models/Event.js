// backend/src/models/Event.js
import { Schema, model } from "mongoose";

const eventSchema = new Schema({
    title: {
        type: String,
        required: [true, 'El título del evento es requerido'],
        maxLength: [200, 'El título no puede exceder 200 caracteres'],
        trim: true
    },

    startDate: {
        type: Date,
        required: [true, 'La fecha de inicio es requerida']
    },

    endDate: {
        type: Date,
        required: [true, 'La fecha de fin es requerida'],
        validate: {
            validator: function(value) {
                return value >= this.startDate;
            },
            message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
        }
    },

    description: {
        type: String,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
        trim: true,
        default: ''
    },

    color: {
        type: String,
        default: '#3b82f6', // Azul por defecto
        match: [/^#[0-9A-F]{6}$/i, 'Color inválido, debe ser formato hexadecimal']
    },

    createdBy: {
        type: Schema.Types.Mixed,
        required: [true, 'El usuario creador es requerido'],
        validate: {
            validator: function(value) {
                return value === 'Admin' || (typeof value === 'object' && value !== null);
            },
            message: 'El creador debe ser un ID de usuario válido o "Admin"'
        }
    }
}, {
    timestamps: true
});

// Índices para mejorar rendimiento en búsquedas por fecha
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ createdBy: 1 });

// Método virtual para calcular duración en días
eventSchema.virtual('durationDays').get(function() {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 para incluir el día de inicio
});

// Método para verificar si un evento está activo
eventSchema.methods.isActive = function() {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
};

// Método para verificar si un evento ya pasó
eventSchema.methods.isPast = function() {
    return new Date() > this.endDate;
};

// Método para verificar si un evento es futuro
eventSchema.methods.isFuture = function() {
    return new Date() < this.startDate;
};

export default model("Event", eventSchema);
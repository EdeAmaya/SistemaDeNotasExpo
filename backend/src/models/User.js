import {Schema, model} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
        trim: true
    },

    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        maxLength: [100, 'El apellido no puede exceder 100 caracteres'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true, // Esto ya crea un índice automáticamente
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido']
    },

    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minLength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },

    role: {
        type: String,
        enum: {
            values: ['Admin', 'Estudiante', 'Docente', 'Evaluador'],
            message: 'Rol inválido. Roles permitidos: Admin, Estudiante, Docente, Evaluador'
        },
        required: [true, 'El rol es requerido']
    },
   
    isVerified: {
        type: Boolean,
        default: false
    },

    // Campos adicionales para seguridad
    loginAttempts: {
        type: Number,
        default: 0
    },

    lockTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,   
    strict: false
});

// Índices para mejorar rendimiento (sin email que ya tiene unique: true)
// userSchema.index({ email: 1 }); // ❌ ELIMINAR ESTA LÍNEA - duplicada
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Método virtual para obtener nombre completo
userSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastName}`;
});

// Método para verificar si la cuenta está bloqueada
userSchema.methods.isLocked = function() {
    return !!(this.lockTime && this.lockTime > Date.now());
};

// Método para incrementar intentos de login fallidos
userSchema.methods.incLoginAttempts = function() {
    // Si hay un lockTime anterior y ya expiró, reiniciar
    if (this.lockTime && this.lockTime < Date.now()) {
        return this.updateOne({
            $unset: { lockTime: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Bloquear cuenta después de 5 intentos fallidos por 2 horas
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockTime: Date.now() + 2 * 60 * 60 * 1000 }; // 2 horas
    }
    
    return this.updateOne(updates);
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockTime: 1 }
    });
};

export default model("User", userSchema);
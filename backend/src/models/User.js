import {Schema, model} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        maxLength: 100
    },

    lastName: {
        type: String,
        require: true,
        maxLength: 100
    },

    email: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    role: {
    type: String,
    enum: ['Admin', 'Estudiante', 'Docente', 'Evaluador'],
    require: true
   },
   
    isVerified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true,   
    strict: false
});

export default model("User", userSchema);
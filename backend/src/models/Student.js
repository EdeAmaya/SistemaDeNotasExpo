import {Schema, model} from "mongoose";

const studentSchema = new Schema({
    studentCode: {
        type: Number,
        required: true,
        unique: true 
    },

    name: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    idLevel: {
        type: Schema.Types.ObjectId,
        ref: "Level",
        required: true
    },

    idSection: {
        type: Schema.Types.ObjectId,
        ref: "Section",
        required: true
    },

    idSpecialty: {
        type: Schema.Types.ObjectId,
        ref: "Specialty"
    },

    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project"
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Student", studentSchema);
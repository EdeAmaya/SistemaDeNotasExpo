import {Schema, model} from "mongoose";

const studentSchema = new Schema({
    studentCode: {
        type: Number,
        require: true
    },

    name: {
        type: String,
        require: true
    },

    lastName: {
        type: String,
        require: true
    },

    idLevel: {
        type: Schema.Types.ObjectId,
        ref: "Level",
        require: true
    },

    idSection: {
        type: Schema.Types.ObjectId,
        ref: "Section",
        require: true
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
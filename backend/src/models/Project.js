import {Schema, model} from "mongoose";

const projectSchema = new Schema({
    projectId: {
        type: String,
        require: true,
        maxLength: 7
    },

    projectName: {
        type: String,
        require: true
    },

    googleSitesLink: {
        type: String
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

    status: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
   }

}, {
    timestamps: true,
    strict: false
});

export default model("Project", projectSchema);
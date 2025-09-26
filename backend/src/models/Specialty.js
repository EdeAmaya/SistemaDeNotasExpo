import {Schema, model} from "mongoose";

const specialtySchema = new Schema({
    specialtyName: {
        type: String,
        require: true
    },

    letterSpecialty: {
        type: String
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Specialty", specialtySchema);
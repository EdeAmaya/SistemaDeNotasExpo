import {Schema, model} from "mongoose";

const sectionSchema = new Schema({
    sectionName: {
        type: String,
        require: true
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Section", sectionSchema);
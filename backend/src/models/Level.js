import {Schema, model} from "mongoose";

const levelSchema = new Schema({
    levelName: {
        type: String,
        require: true
    },

    letterLevel: {
        type: String
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Level", levelSchema);
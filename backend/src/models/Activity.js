import {Schema, model} from "mongoose";

const activitySchema = new Schema({
    title: {
        type: String,
        require: true
    },

    startDate: {
        type: Date,
        require: true
    },

    endDate: {
        type: Date,
        require: true
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Activity", activitySchema);
// Schema para criterios
import {Schema, model} from "mongoose";

// Subdocumento para los criterios
const criterionSchema = new Schema({
  criterionName: {
    type: String,
    required: true
  },
  criterionDescription: {
    type: String,
    required: true
  },
  criterionScore: {
    type: Number,
    required: true
  },
  criterionWeight: {
    type: Number,
    required: true
  }
}, { _id: false });

// Esquema principal de rúbrica
const rubricSchema = new Schema({
  rubricName: {
    type: String,
    required: true
  },
  levelId: {
    type: Number,
    required: true
  },
  specialtyId: {
    type: Number,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  stageId: {
    type: Schema.Types.ObjectId,
    ref: 'Stage',
    required: true
  },
  evaluationTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'EvaluationType',
    required: true
  },
  criteria: [criterionSchema] // Array de criterios
}, {
  timestamps: true
});

export default model("Rubric", rubricSchema);
// Schema para criterios
import { Schema, model } from "mongoose";

// Subdocumento para los criterios
const criterionSchema = new Schema({
  criterionName: {
    type: String,
    required: true
  },
  criterionDescription: {
    type: String,
    required: false
  },
  criterionScore: {
    type: Number,
    required: false
  },
  criterionWeight: {
    type: Number,
    required: false
  }
}, { _id: true });

// Esquema principal de rúbrica
const rubricSchema = new Schema({
  rubricName: {
    type: String,
    required: true
  },
  level: { // Nivel educativo
    type: Number,
    enum: [1, 2], // 1 = Tercer Ciclo, 2 = Bachillerato
    required: true
  },
   levelId: {
    type: Schema.Types.ObjectId,
    ref: "Level", // Grado específico
    required: false
  },
  specialtyId: {
    type: Schema.Types.ObjectId,
    ref: 'Specialty',
    required: false
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
  rubricType: {
    type: Number,
    enum: [1, 2], // 1 = Escala estimativa, 2 = Rúbrica
    required: true,
  },
  criteria: [criterionSchema] // Array de criterios
}, {
  timestamps: true
});

export default model("Rubric", rubricSchema);
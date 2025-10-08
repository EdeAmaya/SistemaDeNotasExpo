// Schema para criterios
import { Schema, model } from "mongoose";

// Subdocumento para las ponderaciones con descripción
const weightSchema = new Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  description: {
    type: String,
    required: false,
    default: null
  }
}, { _id: true });

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
  criterionWeight: {
    type: Number,
    required: false // Porcentaje que vale el criterio
  },
  weights: {
    type: [weightSchema],
    required: false,
    default: []
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
  scaleType: {
    type: Number,
    enum: [1, 2, 3], // 1 = Promedio, 2 = Escala de ejecución, 3 = Desempeño por criterios
    required: false // Solo requerido si rubricType === 1
  },
  criteria: [criterionSchema] // Array de criterios
}, {
  timestamps: true
});

export default model("Rubric", rubricSchema);
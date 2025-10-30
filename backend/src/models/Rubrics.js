// Schema para criterios
import { Schema, model } from "mongoose";

// Subdocumento para las ponderaciones con descripción
const weightSchema = new Schema({
  value: { // valor numérico de la ponderación (Ej: 10, 8, 6, etc.)
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  description: { // descripción de la ponderación, por si necesita especificarse
    type: String,
    required: false,
    default: null
  }
}, { _id: true });

// Subdocumento para los criterios
const criterionSchema = new Schema({
  criterionName: { // Nombre del criterio
    type: String,
    required: true
  },
  criterionDescription: { // Descripción del criterio
    type: String,
    required: false
  },
  criterionWeight: {
    type: Number,
    required: false // Porcentaje que vale el criterio
  },
  weights: {
    type: [weightSchema], // Array de ponderaciones (Excelente, Bueno, Regular, etc.)
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
  specialtyId: { // Especialidad (solo para bachillerato)
    type: Schema.Types.ObjectId,
    ref: 'Specialty',
    required: false
  },
  year: { // Año actual
    type: String,
    required: true
  },
  stageId: { // Etapa del proyecto
    type: Schema.Types.ObjectId,
    ref: 'Stage',
    required: true
  },
  rubricType: { // Tipo de rúbrica
    type: Number,
    enum: [1, 2], // 1 = Escala estimativa, 2 = Rúbrica
    required: true,
  },
  scaleType: { // Tipo de escala (solo si rubricType === 1)
    type: Number,
    enum: [1, 2, 3], // 1 = Promedio, 2 = Escala de ejecución, 3 = Desempeño por criterios
    required: false // Solo requerido si rubricType === 1
  },
  criteria: [criterionSchema] // Array de criterios
}, {
  timestamps: true
});

export default model("Rubric", rubricSchema);
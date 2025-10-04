// Modelo para consolidar las notas de un proyecto basado en evaluaciones
import { Schema, model } from "mongoose";

const projectScoreSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    unique: true // Un consolidado por proyecto
  },
  rubricId: {
    type: Schema.Types.ObjectId,
    ref: "Rubrics",
    required: true
  },
  // Referencia a todas las evaluaciones asociadas
  evaluations: [{
    type: Schema.Types.ObjectId,
    ref: "Evaluations"
  }],
  // Nota interna (promedio o ponderado de evaluaciones internas)
  notaInterna: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  // Nota externa (promedio o ponderado de evaluaciones externas)
  notaExterna: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  // Nota final consolidada (ej: 40% interna + 60% externa)
  notaFinalConsolidada: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  // Para definir cómo se calculó
  metodoConsolidacion: {
    type: String,
    enum: ['ponderado', 'promedio'],
    required: true,
    default: 'ponderado'
  },
  // Posición en el podio (se asigna al calcular ranking)
  posicion: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

export default model("ProjectScore", projectScoreSchema);
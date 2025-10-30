// Modelo para almacenar las puntuaciones y evaluaciones de los proyectos
import { Schema, model } from "mongoose";

const projectScoreSchema = new Schema({
  projectId: { // Referencia al proyecto
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    unique: true
  },
  
  // Nivel educativo del proyecto
  nivel: {
    type: Number,
    min: 1,
    max: 2
  },
  
  // Array con todas las evaluaciones (resumen)
  evaluaciones: [{
    evaluationId: {
      type: Schema.Types.ObjectId,
      ref: "Evaluations"
    },
    rubricId: { // Rúbrica utilizada
      type: Schema.Types.ObjectId,
      ref: "Rubrics"
    },
    rubricName: String,
    notaFinal: Number,
    fecha: Date,
    tipoCalculo: String,
    evaluacionTipo: {
      type: String,
      enum: ['interna', 'externa']
    }
  }],
  
  // Evaluaciones internas separadas
  evaluacionesInternas: [{
    evaluationId: Schema.Types.ObjectId,
    rubricId: Schema.Types.ObjectId,
    rubricName: String,
    notaFinal: Number,
    fecha: Date,
    tipoCalculo: String
  }],
  
  // Evaluaciones externas separadas
  evaluacionesExternas: [{
    evaluationId: Schema.Types.ObjectId,
    rubricId: Schema.Types.ObjectId,
    rubricName: String,
    notaFinal: Number,
    fecha: Date,
    tipoCalculo: String
  }],
  
  // Promedios
  promedioInterno: { // Promedio de evaluaciones internas
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  promedioExterno: { // Promedio de evaluaciones externas
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  // Nota final global (50% interno + 50% externo)
  notaFinalGlobal: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  // Promedio de mejora
  promedioMejora: {
    type: Number,
    default: 0
  },
  
  // Fecha de última evaluación
  fechaUltimaEvaluacion: {
    type: Date
  },
  
  // Total de evaluaciones
  totalEvaluaciones: {
    type: Number,
    default: 0
  },
  
  // Posición en ranking
  posicion: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

export default model("ProjectScore", projectScoreSchema);
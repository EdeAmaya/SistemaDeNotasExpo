// Schema para evaluaciones
import { Schema, model } from "mongoose";

const evaluatedCriterionSchema = new Schema({
  criterionId: {
    type: Schema.Types.ObjectId, // referencia al criterio dentro de la rúbrica
    required: true
  },
  criterionName: {
    type: String, // redundancia para no tener que hacer join
    required: true
  },
  puntajeObtenido: { // puntaje obtenido en este criterio
    type: Number,
    required: true
  }
}, { _id: false });

const evaluationSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project", //Proyectos
    required: true
  },
  rubricId: { // Rúbrica utilizada para la evaluación
    type: Schema.Types.ObjectId, 
    ref: "Rubric",
    required: true
  },
  criteriosEvaluados: [evaluatedCriterionSchema], // Lista de criterios evaluados
  fecha: {
    type: Date,
    default: Date.now
  },
  evaluadorTipo: { // Tipo de evaluador: interna o externa
    type: String,
    enum: ["interna", "externa"],
    required: true,
    default: "interna"
  },
  notaFinal: { // Nota final de la evaluación
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  tipoCalculo: { // Tipo de cálculo de la nota final
    type: String,
    enum: ['ponderado', 'promedio'],
    required: true
  }
}, {
  timestamps: true
});

export default model("Evaluation", evaluationSchema);

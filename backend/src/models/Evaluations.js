// Schema para evaluaciones
import {Schema, model} from "mongoose";

const evaluatedCriterionSchema = new Schema({
  criterionId: {
    type: Schema.Types.ObjectId, // referencia al criterio dentro de la rúbrica
    required: true
  },
  criterionName: {
    type: String, // redundancia para no tener que hacer join
    required: true
  },
  puntajeObtenido: {
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
  rubricId: {
    type: Schema.Types.ObjectId,
    ref: "Rubric",
    required: true
  },
  criteriosEvaluados: [evaluatedCriterionSchema],
  fecha: {
    type: Date,
    default: Date.now
  },
  notaFinal: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    tipoCalculo: {
        type: String,
        enum: ['ponderado', 'promedio'],
        required: true
    }
}, {
  timestamps: true
});

export default model("Evaluation", evaluationSchema);

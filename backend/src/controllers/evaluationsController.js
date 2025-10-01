import Evaluation from "../models/Evaluations.js";
import Rubric from "../models/Rubrics.js";

const evaluationController = {};

// GET - Listar todas las evaluaciones
evaluationController.getEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find()
            .populate("projectId")
            .populate("rubricId");
        res.status(200).json({ success: true, data: evaluations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching evaluations", error: error.message });
    }
};

// GET - Obtener evaluación por ID
evaluationController.getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate("projectId")
            .populate("rubricId");

        if (!evaluation) {
            return res.status(404).json({ success: false, message: "Evaluation not found" });
        }

        res.status(200).json({ success: true, data: evaluation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching evaluation", error: error.message });
    }
};

// POST - Crear evaluación (seleccionando rúbrica y criterios con puntajes)
evaluationController.createEvaluation = async (req, res) => {
    try {
        const { projectId, rubricId, criteriosEvaluados } = req.body;

        // Verificar que la rúbrica existe
        const rubric = await Rubric.findById(rubricId);
        if (!rubric) {
            return res.status(404).json({ success: false, message: "Rubric not found" });
        }

        // Mapear criterios evaluados con info redundante (nombre de criterio)
        const mappedCriteria = criteriosEvaluados.map(c => {
            const crit = rubric.criteria.id(c.criterionId);
            if (!crit) throw new Error(`Criterion ${c.criterionId} not found in rubric`);
            return {
                criterionId: crit._id,
                criterionName: crit.criterionName,
                puntajeObtenido: c.puntajeObtenido
            };
        });

        const evaluation = await Evaluation.create({
            projectId,
            rubricId,
            criteriosEvaluados: mappedCriteria
        });

        res.status(201).json({ success: true, data: evaluation });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error creating evaluation", error: error.message });
    }
};

// PUT - Actualizar evaluación
evaluationController.updateEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!evaluation) {
            return res.status(404).json({ success: false, message: "Evaluation not found" });
        }

        res.status(200).json({ success: true, data: evaluation });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error updating evaluation", error: error.message });
    }
};

// DELETE - Eliminar evaluación
evaluationController.deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ success: false, message: "Evaluation not found" });
        }
        res.status(200).json({ success: true, message: "Evaluation deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting evaluation", error: error.message });
    }
};

export default evaluationController;

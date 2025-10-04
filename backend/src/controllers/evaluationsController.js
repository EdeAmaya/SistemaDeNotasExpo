import Evaluation from "../models/Evaluations.js";
import Rubric from "../models/Rubrics.js";

const evaluationController = {};

// ===============================
// GET - Listar todas las evaluaciones
// ===============================
evaluationController.getEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find()
            .populate("projectId")
            .populate({
                path: "rubricId",
                populate: [
                    { path: "stageId" },
                    { path: "specialtyId" },
                    { path: "levelId" }
                ]
            });

        res.status(200).json({ success: true, data: evaluations });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching evaluations", 
            error: error.message, 
            stack: error.stack 
        });
    }
};

// ===============================
// GET - Obtener evaluación por ID
// ===============================
evaluationController.getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate("projectId")
            .populate({
                path: "rubricId",
                populate: [
                    { path: "stageId" },
                    { path: "specialtyId" },
                    { path: "levelId" }
                ]
            });

        if (!evaluation) {
            return res.status(404).json({ 
                success: false, 
                message: "Evaluation not found" 
            });
        }

        res.status(200).json({ success: true, data: evaluation });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching evaluation", 
            error: error.message,
            stack: error.stack 
        });
    }
};

// ===============================
// POST - Crear evaluación
// ===============================
evaluationController.createEvaluation = async (req, res) => {
  try {
    const { projectId, rubricId, criteriosEvaluados, notaFinal, tipoCalculo } = req.body;

    // Verificar que notaFinal y tipoCalculo estén presentes
    if (notaFinal === undefined || !tipoCalculo) {
      return res.status(400).json({ 
        success: false, 
        message: "notaFinal and tipoCalculo are required" 
      });
    }

    // Buscar la rúbrica con su etapa
    const rubric = await Rubric.findById(rubricId).populate("stageId");
    if (!rubric) {
      return res.status(404).json({ success: false, message: "Rubric not found" });
    }

    // Determinar si es evaluación externa o interna
    let evaluacionTipo = "interna";
    if (rubric.stageId && rubric.stageId.nombre === "Evaluación Externa") {
      evaluacionTipo = "externa";
    }

    // Mapear criterios
    const mappedCriteria = criteriosEvaluados.map(c => {
      const criterionId = c.criterioId || c.criterionId;
      if (!criterionId) {
        throw new Error("Cada criterio debe tener criterioId o criterionId");
      }

      const crit = rubric.criteria.id(criterionId);
      if (!crit) {
        throw new Error(`Criterion ${criterionId} not found in rubric`);
      }

      return {
        criterionId: crit._id,
        criterionName: crit.criterionName,
        puntajeObtenido: c.puntajeObtenido,
        comentario: c.comentario || ""
      };
    });

    // Crear la evaluación
    const evaluation = await Evaluation.create({
      projectId,
      rubricId,
      criteriosEvaluados: mappedCriteria,
      notaFinal,
      tipoCalculo,
      evaluacionTipo // asignado automáticamente
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Error creating evaluation", 
      error: error.message 
    });
  }
};

// ===============================
// PUT - Actualizar evaluación
// ===============================
evaluationController.updateEvaluation = async (req, res) => {
  try {
    const { criteriosEvaluados, rubricId } = req.body;
    let updateData = { ...req.body };

    if (rubricId) {
      const rubric = await Rubric.findById(rubricId).populate("stageId");
      if (!rubric) {
        return res.status(404).json({ 
          success: false, 
          message: "Rubric not found" 
        });
      }

      // Determinar tipo según la etapa
      updateData.evaluacionTipo = (rubric.stageId && rubric.stageId.nombre === "Evaluación Externa")
        ? "externa"
        : "interna";

      if (criteriosEvaluados) {
        const mappedCriteria = criteriosEvaluados.map(c => {
          const criterionId = c.criterioId || c.criterionId;
          if (!criterionId) throw new Error("Cada criterio debe tener criterioId o criterionId");

          const crit = rubric.criteria.id(criterionId);
          if (!crit) throw new Error(`Criterion ${criterionId} not found in rubric`);

          return {
            criterionId: crit._id,
            criterionName: crit.criterionName,
            puntajeObtenido: c.puntajeObtenido,
            comentario: c.comentario || ""
          };
        });
        updateData.criteriosEvaluados = mappedCriteria;
      }
    }

    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("projectId").populate("rubricId");

    if (!evaluation) {
      return res.status(404).json({ 
        success: false, 
        message: "Evaluation not found" 
      });
    }

    res.status(200).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Error updating evaluation", 
      error: error.message 
    });
  }
};

// ===============================
// DELETE - Eliminar evaluación
// ===============================
evaluationController.deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
        if (!evaluation) {
            return res.status(404).json({ 
                success: false, 
                message: "Evaluation not found" 
            });
        }
        res.status(200).json({ success: true, message: "Evaluation deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error deleting evaluation", 
            error: error.message,
            stack: error.stack 
        });
    }
};

export default evaluationController;
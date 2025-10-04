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
        console.log('REQUEST BODY:', JSON.stringify(req.body, null, 2));
        
        const { projectId, rubricId, criteriosEvaluados, notaFinal, tipoCalculo } = req.body;

        // Verificar que notaFinal y tipoCalculo estén presentes
        if (notaFinal === undefined || !tipoCalculo) {
            console.log('Faltan notaFinal o tipoCalculo');
            return res.status(400).json({ 
                success: false, 
                message: "notaFinal and tipoCalculo are required" 
            });
        }

        // Verificar que la rúbrica existe
        const rubric = await Rubric.findById(rubricId);
        if (!rubric) {
            console.log('Rúbrica no encontrada:', rubricId);
            return res.status(404).json({ success: false, message: "Rubric not found" });
        }

        console.log('Rúbrica encontrada:', rubric._id);
        console.log('Criterios en rúbrica:', rubric.criteria.map(c => ({ _id: c._id, name: c.criterionName })));

        const mappedCriteria = criteriosEvaluados.map(c => {
            // Aceptar ambos nombres (español e inglés)
            const criterionId = c.criterioId || c.criterionId;
            
            if (!criterionId) {
                console.log('Criterio sin ID:', c);
                throw new Error('Each criterion must have a criterioId or criterionId');
            }

            console.log('🔍 Buscando criterio:', criterionId);
            const crit = rubric.criteria.id(criterionId);
            
            if (!crit) {
                console.log('Criterio NO encontrado:', criterionId);
                console.log('IDs disponibles:', rubric.criteria.map(cr => cr._id.toString()));
                throw new Error(`Criterion ${criterionId} not found in rubric`);
            }
            
            console.log('Criterio encontrado:', crit.criterionName);
            return {
                criterionId: crit._id,
                criterionName: crit.criterionName,
                puntajeObtenido: c.puntajeObtenido,
                comentario: c.comentario || ''
            };
        });

        const evaluation = await Evaluation.create({
            projectId,
            rubricId,
            criteriosEvaluados: mappedCriteria,
            notaFinal,
            tipoCalculo
        });

        console.log('Evaluación creada exitosamente');
        res.status(201).json({ success: true, data: evaluation });
    } catch (error) {
        console.error('ERROR EN CONTROLADOR:', error.message);
        console.error('STACK:', error.stack);
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

        if (criteriosEvaluados && rubricId) {
            const rubric = await Rubric.findById(rubricId);
            if (!rubric) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Rubric not found" 
                });
            }

            const mappedCriteria = criteriosEvaluados.map(c => {
                const criterionId = c.criterioId || c.criterionId;
                
                if (!criterionId) {
                    throw new Error('Each criterion must have a criterioId or criterionId');
                }

                const crit = rubric.criteria.id(criterionId);
                if (!crit) {
                    throw new Error(`Criterion ${criterionId} not found in rubric`);
                }
                
                return {
                    criterionId: crit._id,
                    criterionName: crit.criterionName,
                    puntajeObtenido: c.puntajeObtenido,
                    comentario: c.comentario || ''
                };
            });

            updateData.criteriosEvaluados = mappedCriteria;
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
            error: error.message,
            stack: error.stack 
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
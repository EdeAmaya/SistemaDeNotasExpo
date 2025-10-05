import Evaluation from "../models/Evaluations.js";
import Rubric from "../models/Rubrics.js";
import ProjectScore from "../models/ProjectScore.js";

const evaluationController = {};

// ===============================
// FUNCIÓN AUXILIAR - Actualizar ProjectScore
// ===============================
const updateProjectScore = async (projectId) => {
    try {
        // Obtener todas las evaluaciones del proyecto
        const evaluations = await Evaluation.find({ projectId })
            .populate({
                path: "rubricId",
                populate: { path: "stageId", select: "name" }
            });

        if (evaluations.length === 0) {
            await ProjectScore.findOneAndDelete({ projectId });
            return;
        }

        // Separar evaluaciones internas y externas
        const internas = [];
        const externas = [];

        evaluations.forEach(ev => {
            const evalData = {
                evaluationId: ev._id,
                rubricId: ev.rubricId._id,
                rubricName: ev.rubricId.rubricName,
                notaFinal: ev.notaFinal,
                fecha: ev.fecha || ev.createdAt,
                tipoCalculo: ev.tipoCalculo
            };

            // Clasificar en evaluacion externa o interna
            const stageName = ev.rubricId?.stageId?.name || '';
            const isExternal = stageName.toLowerCase().includes('externa') ||
                stageName.toLowerCase() === 'evaluación externa';

            if (isExternal) {
                externas.push(evalData);
            } else {
                internas.push(evalData);
            }
        });

        // Calcular promedios
        const notasInternas = internas.map(e => e.notaFinal || 0);
        const notasExternas = externas.map(e => e.notaFinal || 0);
        const todasNotas = [...notasInternas, ...notasExternas];

        const promedioInterno = notasInternas.length
            ? notasInternas.reduce((a, b) => a + b, 0) / notasInternas.length
            : 0;

        const promedioExterno = notasExternas.length
            ? notasExternas.reduce((a, b) => a + b, 0) / notasExternas.length
            : 0;

        // Calcular nota final global ponderada: 50% interno + 50% externo
        let notaFinalGlobal = 0;
        if (notasInternas.length > 0 && notasExternas.length > 0) {
            notaFinalGlobal = (promedioInterno * 0.5) + (promedioExterno * 0.5);
        } else if (notasInternas.length > 0) {
            notaFinalGlobal = promedioInterno;
        } else if (notasExternas.length > 0) {
            notaFinalGlobal = promedioExterno;
        }

        // Calcular promedio de mejora
        let promedioMejora = 0;
        if (todasNotas.length >= 2) {
            const primera = todasNotas[0];
            const ultima = todasNotas[todasNotas.length - 1];
            promedioMejora = primera > 0 ? ((ultima - primera) / primera) * 100 : 0;
        }

        const firstEvaluation = evaluations[0];
        const nivel = firstEvaluation.rubricId?.level || 1;

        const fechas = evaluations
            .map(e => e.fecha || e.createdAt)
            .filter(f => f)
            .sort((a, b) => new Date(b) - new Date(a));
        const fechaUltimaEvaluacion = fechas[0] || new Date();

        // Actualizar o crear ProjectScore
        const scoreData = {
            projectId,
            nivel,
            evaluaciones: evaluations.map(ev => {
                const stageName = ev.rubricId?.stageId?.name || '';
                const isExternal = stageName.toLowerCase().includes('externa') ||
                    stageName.toLowerCase() === 'evaluación externa';

                return {
                    evaluationId: ev._id,
                    rubricId: ev.rubricId._id,
                    rubricName: ev.rubricId.rubricName,
                    notaFinal: ev.notaFinal,
                    fecha: ev.fecha || ev.createdAt,
                    tipoCalculo: ev.tipoCalculo,
                    evaluacionTipo: isExternal ? "externa" : "interna"
                };
            }),
            evaluacionesInternas: internas,
            evaluacionesExternas: externas,
            promedioInterno,
            promedioExterno,
            notaFinalGlobal,
            promedioMejora,
            fechaUltimaEvaluacion,
            totalEvaluaciones: evaluations.length
        };

        await ProjectScore.findOneAndUpdate(
            { projectId },
            scoreData,
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Error actualizando ProjectScore:", error);
        throw error;
    }
};

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
// GET - Obtener todas las evaluaciones de un proyecto con detalles completos
// ===============================
evaluationController.getEvaluationsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Buscar todas las evaluaciones del proyecto
        const evaluations = await Evaluation.find({ projectId })
            .populate("projectId")
            .populate({
                path: "rubricId",
                populate: [
                    { path: "stageId", select: "name" },
                    { path: "specialtyId", select: "specialtyName" },
                    { path: "levelId", select: "levelName" }
                ]
            })
            .sort({ fecha: -1 }); // Ordenar por fecha descendente

        if (!evaluations || evaluations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron evaluaciones para este proyecto"
            });
        }

        // Formatear la respuesta con todos los detalles
        const formattedEvaluations = evaluations.map(ev => {
            const rubric = ev.rubricId;
            
            // Extraer criterios con sus detalles
            const criteriosDetalle = ev.criteriosEvaluados.map(ce => {
                // Buscar el criterio en la rúbrica para obtener detalles completos
                const criterioCompleto = rubric.criteria.id(ce.criterionId);
                
                return {
                    criterionId: ce.criterionId,
                    criterionName: ce.criterionName,
                    puntajeObtenido: ce.puntajeObtenido,
                    comentario: ce.comentario,
                    // Detalles adicionales del criterio de la rúbrica
                    puntajeMaximo: criterioCompleto?.maxScore || 0,
                    peso: criterioCompleto?.weight || 0,
                    descripcion: criterioCompleto?.description || ""
                };
            });

            // Calcular totales
            const totalPuntajeObtenido = criteriosDetalle.reduce((sum, c) => sum + (c.puntajeObtenido || 0), 0);
            const totalPuntajeMaximo = criteriosDetalle.reduce((sum, c) => sum + (c.puntajeMaximo || 0), 0);
            const totalPeso = criteriosDetalle.reduce((sum, c) => sum + (c.peso || 0), 0);

            return {
                evaluationId: ev._id,
                projectId: ev.projectId?._id,
                projectName: ev.projectId?.projectName,
                notaFinal: ev.notaFinal,
                tipoCalculo: ev.tipoCalculo,
                evaluacionTipo: ev.evaluacionTipo,
                fecha: ev.fecha || ev.createdAt,
                rubrica: {
                    rubricId: rubric._id,
                    rubricName: rubric.rubricName,
                    stage: rubric.stageId?.name || "Sin etapa",
                    specialty: rubric.specialtyId?.specialtyName || "Sin especialidad",
                    level: rubric.levelId?.levelName || "Sin nivel",
                    tipoRubrica: rubric.rubricType
                },
                criterios: criteriosDetalle,
                resumen: {
                    totalCriterios: criteriosDetalle.length,
                    totalPuntajeObtenido,
                    totalPuntajeMaximo,
                    totalPeso,
                    porcentajeObtenido: totalPuntajeMaximo > 0 
                        ? ((totalPuntajeObtenido / totalPuntajeMaximo) * 100).toFixed(2) 
                        : 0
                }
            };
        });

        res.status(200).json({
            success: true,
            count: formattedEvaluations.length,
            projectId,
            data: formattedEvaluations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error obteniendo evaluaciones del proyecto",
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
        const rubric = await Rubric.findById(rubricId).populate("stageId", "name");
        if (!rubric) {
            return res.status(404).json({ success: false, message: "Rubric not found" });
        }

        // Determinar si es evaluación externa o interna
        let evaluacionTipo = "interna";
        if (rubric.stageId && rubric.stageId.name === "Evaluación Externa") {
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
            evaluacionTipo
        });

        // Actualizar ProjectScore automáticamente
        await updateProjectScore(projectId);

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
            const rubric = await Rubric.findById(rubricId).populate("stageId", "name");
            if (!rubric) {
                return res.status(404).json({
                    success: false,
                    message: "Rubric not found"
                });
            }

            // Determinar tipo según la etapa
            updateData.evaluacionTipo = (rubric.stageId && rubric.stageId.name === "Evaluación Externa")
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

        // Actualizar ProjectScore automáticamente
        await updateProjectScore(evaluation.projectId._id || evaluation.projectId);

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
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        const projectId = evaluation.projectId;

        await Evaluation.findByIdAndDelete(req.params.id);

        // IMPORTANTE: Actualizar ProjectScore automáticamente
        await updateProjectScore(projectId);

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
// Controller para manejar las operaciones CRUD de rúbricas y criterios
import Rubric from "../models/Rubrics.js";

const rubricController = {};

// =====================
// MANEJO DE RUBRICAS
// =====================

// Crear una nueva rúbrica
rubricController.createRubrics = async (req, res) => {
    try {
        const {
            rubricName,
            level,
            levelId,
            specialtyId,
            year,
            stageId,
            rubricType,
            scaleType,
            criteria
        } = req.body;

        const newRubric = new Rubric({
            rubricName,
            level,
            levelId: levelId || null,
            specialtyId: specialtyId || null,
            year,
            stageId,
            rubricType,
            scaleType: rubricType === 1 ? scaleType : null,
            criteria
        });

        await newRubric.save();
        res.status(201).json({
            message: "Success",
            rubric: newRubric
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating rubric",
            error: error.message
        });
    }
};

// Actualizar una rúbrica
rubricController.updateRubric = async (req, res) => {
    try {
        const {
            rubricName,
            level,
            levelId,
            specialtyId,
            year,
            stageId,
            rubricType,
            scaleType,
            criteria
        } = req.body;

        const updatedRubric = await Rubric.findByIdAndUpdate(
            req.params.id,
            {
                rubricName,
                level,
                levelId: levelId || null,
                specialtyId: specialtyId || null,
                year,
                stageId,
                rubricType,
                scaleType: rubricType === 1 ? scaleType : null,
                criteria
            },
            { new: true, runValidators: true }
        )
            .populate("specialtyId", "specialtyName")
            .populate("stageId", "name")
            .populate("levelId", "levelName");

        if (!updatedRubric) {
            return res.status(404).json({ message: "Rubric not found" });
        }

        res.status(200).json({
            message: "Rubric updated successfully",
            rubric: updatedRubric
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating rubric",
            error: error.message
        });
    }
};

//Select - Con filtrado según rol del usuario
rubricController.getRubrics = async (req, res) => {
    try {
        const user = req.user; // Usuario autenticado desde el middleware
        let query = {};

        // Si es Docente o Evaluador
        if (user.role === 'Docente') {
            // Si su nivel está entre Séptimo, Octavo o Noveno → mostrar solo rúbricas con level = 1
            if (['Séptimo', 'Octavo', 'Noveno'].includes(user.idLevel)) {
                query = { level: 1 };
            } else {
                // Si no, filtrar por su idLevel normalmente
                query = { levelId: user.idLevel };

                // Si tiene especialidad, también filtramos por ella
                if (user.idSpecialty) {
                    query.specialtyId = user.idSpecialty;
                }

                // Si tiene sección, también se puede filtrar
                if (user.idSection) {
                    query.sectionId = user.idSection;
                }
            }
        }

        // Admin y Estudiante ven todas las rúbricas
        const rubrics = await Rubric.find(query)
            .populate("specialtyId", "specialtyName")
            .populate("stageId", "name")
            .populate("levelId", "levelName");

        res.status(200).json(rubrics);
    } catch (error) {
        console.error("Error al obtener rúbricas:", error);
        res.status(500).json({
            message: "Error al obtener rúbricas",
            error: error.message
        });
    }
};

// Obtener una rúbrica por ID
rubricController.getRubricById = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id)
            .populate("specialtyId", "specialtyName")
            .populate("stageId", "name")
            .populate("levelId", "levelName");

        if (!rubric) {
            return res.status(404).json({ message: "Rubric not found" });
        }

        res.status(200).json(rubric);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching rubric",
            error: error.message
        });
    }
};

// Eliminar una rúbrica
rubricController.deleteRubric = async (req, res) => {
    try {
        const deletedRubric = await Rubric.findByIdAndDelete(req.params.id);

        if (!deletedRubric) {
            return res.status(404).json({ message: "Rubric not found" });
        }

        res.status(200).json({ message: "Rubric deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting rubric",
            error: error.message
        });
    }
};

// =====================
//  MANEJO DE CRITERIOS
// =====================

// GET - Obtener criterios de una rúbrica
rubricController.getCriteria = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id);
        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }
        res.status(200).json({
            success: true,
            data: rubric.criteria,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching criteria",
            error: error.message,
        });
    }
};

// POST - Agregar uno o varios criterios a una rúbrica
rubricController.addCriteria = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id);
        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        // Puede recibir un criterio o un array de criterios
        const criteria = Array.isArray(req.body) ? req.body : [req.body];
        rubric.criteria.push(...criteria);

        await rubric.save();

        res.status(201).json({
            success: true,
            data: rubric.criteria,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error adding criteria",
            error: error.message,
        });
    }
};

// PUT - Actualizar un criterio específico dentro de una rúbrica
rubricController.updateCriterion = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id);
        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        const criterion = rubric.criteria.id(req.params.criterionId);
        if (!criterion) {
            return res.status(404).json({
                success: false,
                message: "Criterion not found",
            });
        }

        Object.assign(criterion, req.body);
        await rubric.save();

        res.status(200).json({
            success: true,
            data: criterion,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating criterion",
            error: error.message,
        });
    }
};

// DELETE - Eliminar un criterio de una rúbrica
rubricController.deleteCriterion = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id);
        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        const criterion = rubric.criteria.id(req.params.criterionId);
        if (!criterion) {
            return res.status(404).json({
                success: false,
                message: "Criterion not found",
            });
        }

        criterion.deleteOne();
        await rubric.save();

        res.status(200).json({
            success: true,
            message: "Criterion deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting criterion",
            error: error.message,
        });
    }
};

export default rubricController;

// Controller para manejar las operaciones CRUD de rúbricas y criterios
import Rubric from "../models/Rubrics.js";

const rubricController = {};

// =====================
// MANEJO DE RUBRICAS
// =====================

// GET - Obtener todas las rúbricas
rubricController.getRubrics = async (req, res) => {
    try {
        const rubrics = await Rubric.find()
            .populate("stageId")
            .populate("evaluationTypeId");

        res.status(200).json({
            success: true,
            data: rubrics,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rubrics",
            error: error.message,
        });
    }
};

// GET - Obtener una rúbrica por ID
rubricController.getRubricById = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id)
            .populate("stageId")
            .populate("evaluationTypeId");

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        res.status(200).json({
            success: true,
            data: rubric,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rubric",
            error: error.message,
        });
    }
};

// POST - Crear una o varias rúbricas con criterios
rubricController.createRubrics = async (req, res) => {
    try {
        // Puede recibir un objeto o un array de rúbricas
        const data = Array.isArray(req.body) ? req.body : [req.body];
        const rubrics = await Rubric.insertMany(data);

        res.status(201).json({
            success: true,
            data: rubrics,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating rubrics",
            error: error.message,
        });
    }
};

// PUT - Actualizar una rúbrica completa (incluyendo criterios)
rubricController.updateRubric = async (req, res) => {
    try {
        const rubric = await Rubric.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        res.status(200).json({
            success: true,
            data: rubric,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating rubric",
            error: error.message,
        });
    }
};

// DELETE - Eliminar rúbrica
rubricController.deleteRubric = async (req, res) => {
    try {
        const rubric = await Rubric.findByIdAndDelete(req.params.id);

        if (!rubric) {
            return res.status(404).json({
                success: false,
                message: "Rubric not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Rubric deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting rubric",
            error: error.message,
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
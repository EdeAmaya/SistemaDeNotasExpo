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
            specialtyId,
            year,
            stageId,
            rubricType,
            criteria
        } = req.body;

        const newRubric = new Rubric({
            rubricName,
            level,
            specialtyId: specialtyId || null, // Puede ser opcional
            year,
            stageId,
            rubricType,
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

// Obtener todas las rúbricas
rubricController.getRubrics = async (req, res) => {
    try {
        const rubrics = await Rubric.find()
            .populate("specialtyId", "specialtyName") // opcional
            .populate("stageId", "name"); // trae solo el nombre de la etapa

        res.status(200).json(rubrics);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching rubrics",
            error: error.message
        });
    }
};

// Obtener una rúbrica por ID
rubricController.getRubricById = async (req, res) => {
    try {
        const rubric = await Rubric.findById(req.params.id)
            .populate("specialtyId", "specialtyName")
            .populate("stageId", "stageName");

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

// Actualizar una rúbrica
rubricController.updateRubric = async (req, res) => {
    try {
        const {
            rubricName,
            level,
            specialtyId,
            year,
            stageId,
            rubricType,
            criteria
        } = req.body;

        const updatedRubric = await Rubric.findByIdAndUpdate(
            req.params.id,
            {
                rubricName,
                level,
                specialtyId: specialtyId || null,
                year,
                stageId,
                rubricType,
                criteria
            },
            { new: true, runValidators: true }
        )
            .populate("specialtyId", "specialtyName")
            .populate("stageId", "stageName");

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

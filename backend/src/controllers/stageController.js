const stageController = {};

import stageModel from "../models/Stage.js"; // Modelo

// Select - Obtener todas las etapas
stageController.getStages = async (req, res) => {
  try {
    const stages = await stageModel.find().sort({ order: 1 });
    res.json(stages);
  } catch (error) {
    console.error('Error al obtener etapas:', error);
    res.status(500).json({ 
      message: "Error al obtener etapas", 
      error: error.message 
    });
  }
};

// Select - Obtener etapa por ID
stageController.getStageById = async (req, res) => {
  try {
    const stage = await stageModel.findById(req.params.id);
    if (!stage) {
      return res.status(404).json({ 
        message: "Etapa no encontrada" 
      });
    }
    res.json(stage);
  } catch (error) {
    console.error('Error al obtener etapa:', error);
    res.status(400).json({ 
      message: "ID inválido o error en la consulta",
      error: error.message 
    });
  }
};

// Select - Obtener etapa activa actual (CORREGIDO)
stageController.getCurrentStage = async (req, res) => {
  try {
    const now = new Date();
    
    // Buscar etapa que esté dentro del rango de fechas y activa
    const currentStage = await stageModel.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    }).sort({ order: 1 });

    // Si no hay etapa activa, retornar respuesta exitosa con null
    if (!currentStage) {
      // Verificar si todas las etapas ya pasaron
      const allStages = await stageModel.find().sort({ endDate: -1 }).limit(1);
      const lastStage = allStages[0];
      
      if (lastStage && now > lastStage.endDate) {
        return res.status(200).json({ 
          message: "Todas las etapas han sido completadas",
          currentStage: null,
          allCompleted: true
        });
      }
      
      return res.status(200).json({ 
        message: "No hay etapa activa en este momento",
        currentStage: null,
        allCompleted: false
      });
    }

    res.json(currentStage);
  } catch (error) {
    console.error('Error al obtener etapa actual:', error);
    res.status(500).json({ 
      message: "Error al obtener etapa actual", 
      error: error.message 
    });
  }
};

// Insert - Crear nueva etapa
stageController.insertStage = async (req, res) => {
  try {
    const { 
      percentage, 
      startDate, 
      endDate, 
      name, 
      description, 
      isActive, 
      order 
    } = req.body;

    // Validaciones básicas
    if (!percentage || !startDate || !endDate || !name || !order) {
      return res.status(400).json({ 
        message: "Todos los campos obligatorios son requeridos" 
      });
    }

    // Verificar que el order sea único
    const existingOrder = await stageModel.findOne({ order: parseInt(order) });
    if (existingOrder) {
      return res.status(400).json({
        error: "DUPLICATE_ORDER",
        message: `El orden ${order} ya está en uso`
      });
    }

    // Validar fechas - CORREGIDO: Comparar strings de fecha directamente
    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];
    
    if (endDateOnly <= startDateOnly) {
      return res.status(400).json({
        error: "INVALID_DATES",
        message: "La fecha de fin debe ser posterior a la fecha de inicio"
      });
    }

    // Para operaciones con la base de datos, usar objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Verificar solapamiento de fechas con otras etapas activas
    const overlappingStage = await stageModel.findOne({
      isActive: true,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingStage && (isActive !== false)) {
      return res.status(400).json({
        error: "DATE_OVERLAP",
        message: `Las fechas se solapan con la etapa: ${overlappingStage.name}`
      });
    }

    // Crear y guardar nueva etapa
    const newStage = new stageModel({
      percentage: percentage.trim(),
      startDate: start,
      endDate: end,
      name: name.trim(),
      description: description ? description.trim() : "",
      isActive: isActive !== undefined ? isActive : true,
      order: parseInt(order)
    });

    const savedStage = await newStage.save();
    
    res.status(201).json({
      message: "Etapa creada exitosamente",
      stage: savedStage
    });

  } catch (error) {
    console.error("Error al insertar etapa:", error);
    
    // Manejo de errores específicos
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "VALIDATION_ERROR",
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: "DUPLICATE_ERROR",
        message: "Ya existe una etapa con este orden"
      });
    }
    
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error interno del servidor",
      details: error.message
    });
  }
};

// Delete - Eliminar etapa
stageController.deleteStage = async (req, res) => {
  try {
    const deletedStage = await stageModel.findByIdAndDelete(req.params.id);
    
    // Verificar si la etapa existía
    if (!deletedStage) {
      return res.status(404).json({
        error: "STAGE_NOT_FOUND",
        message: "Etapa no encontrada"
      });
    }
    
    res.json({
      message: "Etapa eliminada exitosamente",
      deletedStage: deletedStage
    });
  } catch (error) {
    console.error("Error al eliminar etapa:", error);
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error al eliminar la etapa",
      details: error.message
    });
  }
};

// Update - Actualizar etapa
stageController.updateStage = async (req, res) => {
  try {
    const { 
      percentage, 
      startDate, 
      endDate, 
      name, 
      description, 
      isActive, 
      order 
    } = req.body;

    // Verificar que la etapa existe
    const existingStage = await stageModel.findById(req.params.id);
    if (!existingStage) {
      return res.status(404).json({
        error: "STAGE_NOT_FOUND",
        message: "Etapa no encontrada"
      });
    }

    // Verificar order único (excluyendo la etapa actual)
    if (order && order !== existingStage.order) {
      const duplicateOrder = await stageModel.findOne({ 
        order: parseInt(order),
        _id: { $ne: req.params.id }
      });

      // Verificar si ya existe una etapa con el mismo orden
      if (duplicateOrder) {
        return res.status(400).json({
          error: "DUPLICATE_ORDER",
          message: `El orden ${order} ya está en uso`
        });
      }
    }

    // Validar fechas si se proporcionan - CORREGIDO
    // Determinar qué fechas usar para validación (nuevas o existentes)
    const finalStartDate = startDate || existingStage.startDate.toISOString();
    const finalEndDate = endDate || existingStage.endDate.toISOString();
    
    // Extraer solo la parte de fecha para comparación sin conversión de zona horaria
    const startDateOnly = finalStartDate.split('T')[0];
    const endDateOnly = finalEndDate.split('T')[0];
    
    // Comparar strings de fecha directamente
    if (endDateOnly <= startDateOnly) {
      return res.status(400).json({
        error: "INVALID_DATES",
        message: "La fecha de fin debe ser posterior a la fecha de inicio"
      });
    }

    // Para la validación de solapamiento, usar las fechas ISO directamente
    const start = new Date(finalStartDate);
    const end = new Date(finalEndDate);

    // Verificar solapamiento de fechas (excluyendo la etapa actual)
    const overlappingStage = await stageModel.findOne({
      _id: { $ne: req.params.id },
      isActive: true,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingStage && (isActive !== false)) {
      return res.status(400).json({
        error: "DATE_OVERLAP",
        message: `Las fechas se solapan con la etapa: ${overlappingStage.name}`
      });
    }

    // Actualizar etapa
    const updatedStage = await stageModel.findByIdAndUpdate(
      req.params.id,
      {
        // Actualizar solo los campos proporcionados
        percentage: percentage ? percentage.trim() : existingStage.percentage,
        startDate: startDate ? new Date(startDate) : existingStage.startDate,
        endDate: endDate ? new Date(endDate) : existingStage.endDate,
        name: name ? name.trim() : existingStage.name,
        description: description !== undefined ? description.trim() : existingStage.description,
        isActive: isActive !== undefined ? isActive : existingStage.isActive,
        order: order ? parseInt(order) : existingStage.order
      },
      { 
        new: true,
        runValidators: true
      }
    );

    res.json({
      message: "Etapa actualizada exitosamente",
      stage: updatedStage
    });

  } catch (error) {
    console.error("Error al actualizar etapa:", error);
    
    // Manejo de errores específicos
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "VALIDATION_ERROR",
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }

    //  Manejo de error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        error: "DUPLICATE_ERROR",
        message: "Ya existe una etapa con este orden"
      });
    }
    
    res.status(500).json({
      error: "SERVER_ERROR",
      message: "Error al actualizar la etapa",
      details: error.message
    });
  }
};

export default stageController;
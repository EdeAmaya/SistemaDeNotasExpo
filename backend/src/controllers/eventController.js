// backend/src/controllers/eventController.js
import eventModel from "../models/Event.js";
import ActivityLogger from "../utils/activityLogger.js";

const eventController = {};

// Obtener todos los eventos
eventController.getEvents = async (req, res) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    
    let filter = {};
    
    if (startDate && endDate) {
      filter = {
        $or: [
          { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
          {
            startDate: { $lte: new Date(startDate) },
            endDate: { $gte: new Date(endDate) }
          }
        ]
      };
    }
    else if (month && year) {
      const monthInt = parseInt(month);
      const yearInt = parseInt(year);
      const startOfMonth = new Date(yearInt, monthInt - 1, 1);
      const endOfMonth = new Date(yearInt, monthInt, 0, 23, 59, 59);
      
      filter = {
        $or: [
          { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
          { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
          {
            startDate: { $lte: startOfMonth },
            endDate: { $gte: endOfMonth }
          }
        ]
      };
    }

    const events = await eventModel
      .find(filter)
      .sort({ startDate: 1 });
    
    // Poblar manualmente solo los que no son "Admin"
    for (let event of events) {
      if (event.createdBy !== 'Admin') {
        await event.populate('createdBy', 'name lastName email');
      } else {
        event._doc.createdBy = {
          name: 'Sistema',
          lastName: 'Administrador',
          email: 'admin@ricaldone.edu.sv'
        };
      }
    }
    
    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ 
      message: "Error al obtener eventos", 
      error: error.message 
    });
  }
};

// Obtener evento por ID
eventController.getEventById = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    
    // Poblar manualmente solo si no es "Admin"
    if (event.createdBy !== 'Admin') {
      await event.populate('createdBy', 'name lastName email');
    } else {
      event._doc.createdBy = {
        name: 'Sistema',
        lastName: 'Administrador',
        email: 'admin@ricaldone.edu.sv'
      };
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(400).json({ 
      message: "ID inválido o error en la consulta",
      error: error.message 
    });
  }
};

// Crear nuevo evento (Solo Admin)
eventController.createEvent = async (req, res) => {
  try {
    const { title, startDate, endDate, description, color } = req.body;

    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: "Usuario no autenticado" 
      });
    }

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Título, fecha de inicio y fecha de fin son requeridos" 
      });
    }

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ 
        message: "La fecha de fin debe ser posterior o igual a la fecha de inicio" 
      });
    }

    const newEvent = new eventModel({
      title: title.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: description?.trim() || '',
      color: color || '#3b82f6',
      createdBy: req.user._id // Asegurarse de usar el ID del usuario autenticado
    });

    const savedEvent = await newEvent.save();
    
    // Poblar información del creador solo si NO es Admin string
    if (req.user._id !== "Admin") {
      await savedEvent.populate('createdBy', 'name lastName email');
    } else {
      // Para Admin string, crear objeto temporal
      savedEvent._doc.createdBy = {
        name: 'Sistema',
        lastName: 'Administrador',
        email: req.user.email
      };
    }

    // Log de actividad
    await ActivityLogger.log(
      req.user._id,
      'CREATE_EVENT',
      `Creó el evento "${savedEvent.title}" del ${new Date(savedEvent.startDate).toLocaleDateString()} al ${new Date(savedEvent.endDate).toLocaleDateString()}`,
      'Event',
      savedEvent._id,
      { title: savedEvent.title, startDate: savedEvent.startDate, endDate: savedEvent.endDate },
      req
    );

    res.status(201).json({
      message: "Evento creado exitosamente",
      event: savedEvent
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear evento", 
      error: error.message 
    });
  }
};

// Actualizar evento (Solo Admin)
eventController.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startDate, endDate, description, color } = req.body;

    const currentEvent = await eventModel.findById(id);
    if (!currentEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Preparar datos de actualización
    const updateData = {
      title: title?.trim() || currentEvent.title,
      description: description !== undefined ? description.trim() : currentEvent.description,
      color: color || currentEvent.color
    };

    // Manejar fechas si se proporcionan
    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    // Verificar que la fecha de fin no sea anterior a la de inicio
    const finalStartDate = updateData.startDate || currentEvent.startDate;
    const finalEndDate = updateData.endDate || currentEvent.endDate;
    
    if (new Date(finalEndDate) < new Date(finalStartDate)) {
      return res.status(400).json({ 
        message: "La fecha de fin debe ser posterior o igual a la fecha de inicio" 
      });
    }

    const updatedEvent = await eventModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Poblar manualmente solo si no es "Admin"
    if (updatedEvent.createdBy !== 'Admin') {
      await updatedEvent.populate('createdBy', 'name lastName email');
    } else {
      updatedEvent._doc.createdBy = {
        name: 'Sistema',
        lastName: 'Administrador',
        email: 'admin@ricaldone.edu.sv'
      };
    }

    // Log de actividad
    await ActivityLogger.log(
      req.user._id,
      'UPDATE_EVENT',
      `Actualizó el evento "${updatedEvent.title}"`,
      'Event',
      updatedEvent._id,
      { title: updatedEvent.title, startDate: updatedEvent.startDate, endDate: updatedEvent.endDate },
      req
    );

    res.json({
      message: "Evento actualizado exitosamente",
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Error de validación: " + errorMessages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: "Error al actualizar evento", 
      error: error.message 
    });
  }
};

// Eliminar evento (Solo Admin)
eventController.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await eventModel.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Log de actividad
    await ActivityLogger.log(
      req.user._id,
      'DELETE_EVENT',
      `Eliminó el evento "${deletedEvent.title}"`,
      'Event',
      deletedEvent._id,
      { title: deletedEvent.title, startDate: deletedEvent.startDate, endDate: deletedEvent.endDate },
      req
    );

    res.json({ message: "Evento eliminado exitosamente" });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ 
      message: "Error al eliminar evento", 
      error: error.message 
    });
  }
};

// Verificar disponibilidad de fechas
eventController.checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate, excludeEventId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Se requieren fecha de inicio y fin" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Buscar eventos que se solapen con las fechas proporcionadas
    let filter = {
      $or: [
        // Eventos que comienzan en el rango
        { startDate: { $gte: start, $lte: end } },
        // Eventos que terminan en el rango
        { endDate: { $gte: start, $lte: end } },
        // Eventos que abarcan todo el rango
        {
          startDate: { $lte: start },
          endDate: { $gte: end }
        }
      ]
    };

    // Excluir un evento específico (útil para edición)
    if (excludeEventId) {
      filter._id = { $ne: excludeEventId };
    }

    const overlappingEvents = await eventModel.find(filter);

    res.json({
      available: overlappingEvents.length === 0,
      overlappingEvents: overlappingEvents.map(e => ({
        id: e._id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate
      }))
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ 
      message: "Error al verificar disponibilidad", 
      error: error.message 
    });
  }
};

// Obtener fechas ocupadas en un rango
eventController.getOccupiedDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Se requieren fecha de inicio y fin" 
      });
    }

    const events = await eventModel.find({
      $or: [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ]
    }).select('startDate endDate title');

    // Crear array con todas las fechas ocupadas
    const occupiedDates = [];
    events.forEach(event => {
      const currentDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      while (currentDate <= endDate) {
        occupiedDates.push({
          date: new Date(currentDate).toISOString().split('T')[0],
          eventTitle: event.title
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    res.json(occupiedDates);
  } catch (error) {
    console.error('Error al obtener fechas ocupadas:', error);
    res.status(500).json({ 
      message: "Error al obtener fechas ocupadas", 
      error: error.message 
    });
  }
};

export default eventController;
const studentController = {};

import studentModel from "../models/Student.js";
import ActivityLogger from "../utils/activityLogger.js"; // ← NUEVO IMPORT

//Select
studentController.getStudents = async (req, res) => {
  try {
    const students = await studentModel.find()
      .populate("idLevel")
      .populate("idSection")
      .populate("idSpecialty")
      .populate("projectId");
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener estudiantes",
      error: error.message
    });
  }
};

// Verificar si un código de estudiante ya existe
studentController.checkStudentCode = async (req, res) => {
  try {
    const { studentCode } = req.params;
    const { excludeId } = req.query;

    let query = { studentCode: parseInt(studentCode) };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingStudent = await studentModel.findOne(query);

    if (existingStudent) {
      res.json({
        exists: true,
        message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
        student: {
          name: existingStudent.name,
          lastName: existingStudent.lastName,
          id: existingStudent._id
        }
      });
    } else {
      res.json({
        exists: false,
        message: 'Código disponible'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al verificar código",
      error: error.message
    });
  }
};

//Insert
studentController.insertStudent = async (req, res) => {
  try {
    const { studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId } = req.body;

    const existingStudent = await studentModel.findOne({ studentCode: parseInt(studentCode) });
    if (existingStudent) {
      return res.status(400).json({
        message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
        error: "DUPLICATE_CODE"
      });
    }

    const newStudent = new studentModel({
      studentCode: parseInt(studentCode),
      name: name.trim(),
      lastName: lastName.trim(),
      idLevel,
      idSection,
      idSpecialty: idSpecialty || null,
      projectId: projectId || null
    });

    const savedStudent = await newStudent.save();

    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'CREATE_STUDENT',
      `Registró al estudiante "${savedStudent.name} ${savedStudent.lastName}"`,
      'Student',
      savedStudent._id,
      { studentCode: savedStudent.studentCode },
      req
    );

    res.status(201).json({
      message: "Estudiante registrado exitosamente",
      student: savedStudent
    });

  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "El código de estudiante ya existe. Por favor, use un código diferente.",
        error: "DUPLICATE_CODE"
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        message: "Datos inválidos",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error al registrar estudiante",
        error: error.message
      });
    }
  }
};

//Delete
studentController.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await studentModel.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Estudiante no encontrado"
      });
    }

    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'DELETE_STUDENT',
      `Eliminó al estudiante "${deletedStudent.name} ${deletedStudent.lastName}"`,
      'Student',
      deletedStudent._id,
      { studentCode: deletedStudent.studentCode },
      req
    );

    res.json({
      message: "Estudiante eliminado exitosamente",
      student: deletedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar estudiante",
      error: error.message
    });
  }
};

//Update
studentController.updateStudent = async (req, res) => {
  try {
    const { studentCode, name, lastName, idLevel, idSection, idSpecialty, projectId } = req.body;
    const studentId = req.params.id;

    if (studentCode) {
      const existingStudent = await studentModel.findOne({
        studentCode: parseInt(studentCode),
        _id: { $ne: studentId }
      });

      if (existingStudent) {
        return res.status(400).json({
          message: `El código ${studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`,
          error: "DUPLICATE_CODE"
        });
      }
    }

    const updateData = {
      studentCode: parseInt(studentCode),
      name: name.trim(),
      lastName: lastName.trim(),
      idLevel,
      idSection,
      idSpecialty: idSpecialty || null,
      projectId: projectId || null
    };

    const updatedStudent = await studentModel.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Estudiante no encontrado"
      });
    }

    // ← NUEVO: LOG DE ACTIVIDAD
    await ActivityLogger.log(
      req.user._id,
      'UPDATE_STUDENT',
      `Editó al estudiante "${updatedStudent.name} ${updatedStudent.lastName}"`,
      'Student',
      updatedStudent._id,
      { studentCode: updatedStudent.studentCode },
      req
    );

    res.json({
      message: "Estudiante actualizado exitosamente",
      student: updatedStudent
    });

  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "El código de estudiante ya existe. Por favor, use un código diferente.",
        error: "DUPLICATE_CODE"
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({
        message: "Datos inválidos",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Error al actualizar estudiante",
        error: error.message
      });
    }
  }
};

studentController.bulkInsertStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "No se proporcionaron estudiantes para cargar",
        error: "INVALID_DATA"
      });
    }

    const results = {
      success: 0,
      failed: 0,
      total: students.length,
      errors: [],
      createdStudents: []
    };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];

      try {
        const existingStudent = await studentModel.findOne({
          studentCode: parseInt(studentData.studentCode)
        });

        if (existingStudent) {
          results.failed++;
          results.errors.push({
            student: `${studentData.name} ${studentData.lastName}`,
            code: studentData.studentCode,
            error: `El código ${studentData.studentCode} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`
          });
          continue;
        }

        const newStudent = new studentModel({
          studentCode: parseInt(studentData.studentCode),
          name: studentData.name.trim(),
          lastName: studentData.lastName.trim(),
          idLevel: studentData.idLevel,
          idSection: studentData.idSection,
          idSpecialty: studentData.idSpecialty || null,
          projectId: studentData.projectId || null
        });

        const savedStudent = await newStudent.save();

        await ActivityLogger.log(
          req.user._id,
          'CREATE_STUDENT_BULK',
          `Registró al estudiante "${savedStudent.name} ${savedStudent.lastName}" mediante carga masiva`,
          'Student',
          savedStudent._id,
          { studentCode: savedStudent.studentCode, bulk: true },
          req
        );

        results.success++;
        results.createdStudents.push(savedStudent);

      } catch (error) {
        results.failed++;
        results.errors.push({
          student: `${studentData.name} ${studentData.lastName}`,
          code: studentData.studentCode,
          error: error.message || 'Error desconocido al guardar'
        });
      }
    }

    if (results.success > 0) {
      await ActivityLogger.log(
        req.user._id,
        'BULK_UPLOAD_STUDENTS',
        `Cargó ${results.success} estudiantes mediante archivo Excel (${results.failed} fallidos de ${results.total} totales)`,
        'Student',
        null,
        {
          total: results.total,
          success: results.success,
          failed: results.failed
        },
        req
      );
    }

    res.status(200).json({
      message: `Carga masiva completada. ${results.success} exitosos, ${results.failed} fallidos`,
      ...results
    });

  } catch (error) {
    console.error('Error en carga masiva:', error);
    res.status(500).json({
      message: "Error en la carga masiva de estudiantes",
      error: error.message
    });
  }
};

studentController.deleteAllStudents = async (req, res) => {
  try {
    const count = await studentModel.countDocuments();

    if (count === 0) {
      return res.status(404).json({
        message: "No hay estudiantes para eliminar"
      });
    }

    const result = await studentModel.deleteMany({});

    await ActivityLogger.log(
      req.user._id,
      'DELETE_ALL_STUDENTS',
      `Eliminó TODOS los estudiantes del sistema (${count} registros)`,
      'Student',
      null,
      { deletedCount: count },
      req
    );

    res.json({
      message: `Se eliminaron ${count} estudiantes exitosamente`,
      deletedCount: count
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar todos los estudiantes",
      error: error.message
    });
  }
};

export default studentController;
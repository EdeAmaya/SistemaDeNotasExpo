import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import ProjectScore from "../models/ProjectScore.js";
import Project from "../models/Project.js";
import Specialty from "../models/Specialty.js";

const diplomasController = {};

const generateProjectDiplomaPDF = async (students, place, projectName, date) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      students.forEach((student, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const studentName = `${student.name} ${student.lastName}`;
        const placeText = place === 1 ? 'PRIMER LUGAR' : place === 2 ? 'SEGUNDO LUGAR' : 'TERCER LUGAR';

        const pageHeight = doc.page.height;
        const startY = pageHeight / 2 - 150;

        doc.fontSize(28)
           .font('Helvetica-Bold')
           .text(studentName.toUpperCase(), 50, startY, {
             width: doc.page.width - 100,
             align: 'center'
           });

        doc.moveDown(2);
        doc.fontSize(22)
           .font('Helvetica-Bold')
           .text(placeText, {
             width: doc.page.width - 100,
             align: 'center'
           });

        doc.moveDown(2);
        doc.fontSize(18)
           .font('Helvetica')
           .text('PROYECTO:', {
             width: doc.page.width - 100,
             align: 'center'
           });

        doc.moveDown(0.5);
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(projectName.toUpperCase(), {
             width: doc.page.width - 100,
             align: 'center'
           });

        doc.moveDown(3);
        doc.fontSize(14)
           .font('Helvetica')
           .text(date, {
             width: doc.page.width - 100,
             align: 'center'
           });
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Función para extraer información del projectId
const parseProjectId = (projectId) => {
  // Formato esperado: E302-25 (Letra de especialidad + Nivel + Número de equipo + Año)
  const match = projectId.match(/^([A-Z])(\d)(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  return {
    specialtyLetter: match[1],
    levelNumber: parseInt(match[2]),
    teamNumber: parseInt(match[3]),
    year: match[4]
  };
};

// Endpoint para descargar diplomas de una sección (Tercer Ciclo)
diplomasController.downloadDiplomasSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const projects = await Project.find({ idSection: sectionId })
      .populate("idLevel")
      .populate("idSection")
      .populate("selectedSpecialty")
      .populate("assignedStudents")
      .sort({ teamNumber: 1 });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron proyectos para esta sección"
      });
    }

    const projectsWithScores = await Promise.all(
      projects.map(async (project) => {
        const score = await ProjectScore.findOne({ projectId: project._id });
        const internas = score?.evaluacionesInternas || [];
        const externas = score?.evaluacionesExternas || [];
        const notasInternas = internas.map(ev => ev.notaFinal || 0);
        const notasExternas = externas.map(ev => ev.notaFinal || 0);
        const totalNotas = [...notasInternas, ...notasExternas];
        const promedioTotal = totalNotas.length
          ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
          : 0;

        return {
          project,
          promedioTotal: parseFloat(promedioTotal.toFixed(2))
        };
      })
    );

    projectsWithScores.sort((a, b) => b.promedioTotal - a.promedioTotal);

    const top3Projects = projectsWithScores.slice(0, 3);

    if (top3Projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay proyectos con calificaciones"
      });
    }

    const zip = new JSZip();
    const fecha = new Date().toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    for (let i = 0; i < top3Projects.length; i++) {
      const { project } = top3Projects[i];
      const place = i + 1;
      const students = project.assignedStudents;

      if (students && students.length > 0) {
        const pdfBuffer = await generateProjectDiplomaPDF(
          students,
          place,
          project.projectName,
          `San Salvador, ${fecha}`
        );

        const placeFolder = `${place === 1 ? '1er' : place === 2 ? '2do' : '3er'}_Lugar`;
        const projectNameClean = project.projectName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${projectNameClean}_${students.length}_estudiantes.pdf`;
        
        zip.folder(placeFolder).file(fileName, pdfBuffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const sectionName = projects[0]?.idSection?.sectionName || 'Seccion';
    const levelName = projects[0]?.idLevel?.levelName || 'Nivel';
    const fileName = `Diplomas_${levelName.replace(/\s+/g, '_')}_${sectionName}_Top3.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.send(zipBuffer);

  } catch (error) {
    console.error('Error generating diplomas:', error);
    res.status(500).json({
      success: false,
      message: "Error al generar diplomas",
      error: error.message
    });
  }
};

// Nuevo endpoint para descargar diplomas de bachillerato por nivel y especialidad
diplomasController.downloadDiplomasBachillerato = async (req, res) => {
  try {
    const { levelId, specialtyId } = req.params;

    // Obtener la especialidad para conocer su letra
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: "Especialidad no encontrada"
      });
    }

    // Obtener todos los proyectos del nivel y especialidad
    const allProjects = await Project.find({ idLevel: levelId })
      .populate("idLevel")
      .populate("selectedSpecialty")
      .populate("assignedStudents")
      .sort({ teamNumber: 1 });

    // Filtrar proyectos por especialidad usando el projectId
    const projects = allProjects.filter(project => {
      const parsed = parseProjectId(project.projectId);
      return parsed && parsed.specialtyLetter === specialty.letterSpecialty;
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron proyectos para este nivel y especialidad"
      });
    }

    // Calcular promedios y ordenar
    const projectsWithScores = await Promise.all(
      projects.map(async (project) => {
        const score = await ProjectScore.findOne({ projectId: project._id });
        const internas = score?.evaluacionesInternas || [];
        const externas = score?.evaluacionesExternas || [];
        const notasInternas = internas.map(ev => ev.notaFinal || 0);
        const notasExternas = externas.map(ev => ev.notaFinal || 0);
        const totalNotas = [...notasInternas, ...notasExternas];
        const promedioTotal = totalNotas.length
          ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
          : 0;

        return {
          project,
          promedioTotal: parseFloat(promedioTotal.toFixed(2))
        };
      })
    );

    projectsWithScores.sort((a, b) => b.promedioTotal - a.promedioTotal);

    const top3Projects = projectsWithScores.slice(0, 3);

    if (top3Projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay proyectos con calificaciones"
      });
    }

    const zip = new JSZip();
    const fecha = new Date().toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    for (let i = 0; i < top3Projects.length; i++) {
      const { project } = top3Projects[i];
      const place = i + 1;
      const students = project.assignedStudents;

      if (students && students.length > 0) {
        const pdfBuffer = await generateProjectDiplomaPDF(
          students,
          place,
          project.projectName,
          `San Salvador, ${fecha}`
        );

        const placeFolder = `${place === 1 ? '1er' : place === 2 ? '2do' : '3er'}_Lugar`;
        const projectNameClean = project.projectName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${projectNameClean}_${students.length}_estudiantes.pdf`;
        
        zip.folder(placeFolder).file(fileName, pdfBuffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const levelName = projects[0]?.idLevel?.levelName || 'Nivel';
    const specialtyName = specialty.specialtyName.replace(/\s+/g, '_');
    const fileName = `Diplomas_${levelName.replace(/\s+/g, '_')}_${specialtyName}_Top3.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.send(zipBuffer);

  } catch (error) {
    console.error('Error generating bachillerato diplomas:', error);
    res.status(500).json({
      success: false,
      message: "Error al generar diplomas",
      error: error.message
    });
  }
};

// Nuevo endpoint para descargar diploma individual por lugar
diplomasController.downloadDiplomaByPlace = async (req, res) => {
  try {
    const { levelId, specialtyId, place } = req.params;
    const placeNum = parseInt(place);

    if (![1, 2, 3].includes(placeNum)) {
      return res.status(400).json({
        success: false,
        message: "El lugar debe ser 1, 2 o 3"
      });
    }

    // Obtener la especialidad para conocer su letra
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: "Especialidad no encontrada"
      });
    }

    // Obtener todos los proyectos del nivel
    const allProjects = await Project.find({ idLevel: levelId })
      .populate("idLevel")
      .populate("selectedSpecialty")
      .populate("assignedStudents")
      .sort({ teamNumber: 1 });

    // Filtrar proyectos por especialidad usando el projectId
    const projects = allProjects.filter(project => {
      const parsed = parseProjectId(project.projectId);
      return parsed && parsed.specialtyLetter === specialty.letterSpecialty;
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron proyectos para este nivel y especialidad"
      });
    }

    // Calcular promedios y ordenar
    const projectsWithScores = await Promise.all(
      projects.map(async (project) => {
        const score = await ProjectScore.findOne({ projectId: project._id });
        const internas = score?.evaluacionesInternas || [];
        const externas = score?.evaluacionesExternas || [];
        const notasInternas = internas.map(ev => ev.notaFinal || 0);
        const notasExternas = externas.map(ev => ev.notaFinal || 0);
        const totalNotas = [...notasInternas, ...notasExternas];
        const promedioTotal = totalNotas.length
          ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
          : 0;

        return {
          project,
          promedioTotal: parseFloat(promedioTotal.toFixed(2))
        };
      })
    );

    projectsWithScores.sort((a, b) => b.promedioTotal - a.promedioTotal);

    if (projectsWithScores.length < placeNum) {
      return res.status(404).json({
        success: false,
        message: `No hay suficientes proyectos para el lugar ${placeNum}`
      });
    }

    const selectedProject = projectsWithScores[placeNum - 1];
    const students = selectedProject.project.assignedStudents;

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "El proyecto no tiene estudiantes asignados"
      });
    }

    const fecha = new Date().toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const pdfBuffer = await generateProjectDiplomaPDF(
      students,
      placeNum,
      selectedProject.project.projectName,
      `San Salvador, ${fecha}`
    );

    const projectNameClean = selectedProject.project.projectName.replace(/[^a-zA-Z0-9]/g, '_');
    const placeText = placeNum === 1 ? '1er' : placeNum === 2 ? '2do' : '3er';
    const fileName = `Diploma_${placeText}_Lugar_${projectNameClean}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating diploma by place:', error);
    res.status(500).json({
      success: false,
      message: "Error al generar diploma",
      error: error.message
    });
  }
};

export default diplomasController;
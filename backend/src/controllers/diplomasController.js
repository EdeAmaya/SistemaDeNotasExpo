import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import ProjectScore from "../models/ProjectScore.js";
import Project from "../models/Project.js";

const diplomasController = {};

const generateProjectDiplomaPDF = async (students, place, projectName, date) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
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

export default diplomasController;
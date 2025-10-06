import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import ProjectScore from "../models/ProjectScore.js";
import Project from "../models/Project.js";

const diplomasController = {};

const generateDiplomaPDF = async (studentName, place, projectName, date) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [792, 612], 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const redBrown = '#8B4513';
      const gold = '#DAA520';
      const darkGray = '#2C2C2C';

      doc.rect(20, 20, 752, 572)
         .lineWidth(3)
         .strokeColor(gold)
         .stroke();

      doc.rect(30, 30, 732, 552)
         .lineWidth(2)
         .strokeColor(darkGray)
         .stroke();

      doc.rect(50, 40, 692, 80)
         .fillColor(redBrown)
         .fill();

      doc.fontSize(24)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text('EXPO', 70, 60, { width: 100, align: 'left' });
      
      doc.fontSize(18)
         .text('TÉCNICA', 70, 90, { width: 100, align: 'left' });

      doc.fontSize(48)
         .fillColor(gold)
         .font('Helvetica-Bold')
         .text('EXPOTÉCNICA', 200, 140, { width: 400, align: 'center' });

      doc.fontSize(24)
         .fillColor(darkGray)
         .font('Helvetica-Bold')
         .text('INSTITUTO TÉCNICO RICALDONE', 100, 200, { width: 592, align: 'center' });

      doc.fontSize(14)
         .fillColor(darkGray)
         .font('Helvetica')
         .text('Extiende el presente reconocimiento:', 100, 260, { width: 592, align: 'center' });

      doc.fontSize(22)
         .fillColor(darkGray)
         .font('Helvetica-Bold')
         .text(`A: ${studentName.toUpperCase()}`, 100, 300, { width: 592, align: 'center' });

      const placeText = place === 1 ? 'PRIMER LUGAR' : place === 2 ? 'SEGUNDO LUGAR' : 'TERCER LUGAR';
      doc.fontSize(16)
         .fillColor(darkGray)
         .font('Helvetica')
         .text('POR HABER OBTENIDO:', 100, 350, { width: 592, align: 'center' });
      
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(placeText, 100, 375, { width: 592, align: 'center' });

      doc.fontSize(14)
         .font('Helvetica')
         .text('PROYECTO:', 100, 420, { width: 592, align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(projectName.toUpperCase(), 100, 445, { width: 592, align: 'center' });

      doc.fontSize(12)
         .font('Helvetica')
         .text(date, 100, 495, { width: 592, align: 'center' });

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Pbro. Alex Figueroa. SDB.', 250, 530, { width: 292, align: 'center' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('Director', 250, 545, { width: 292, align: 'center' });

      doc.rect(50, 150, 15, 40).fillColor('#8B0000').fill();
      doc.rect(50, 200, 15, 40).fillColor('#B22222').fill();
      doc.rect(50, 250, 15, 40).fillColor(gold).fill();
      doc.rect(50, 300, 15, 40).fillColor('#DAA520').fill();

      doc.rect(727, 150, 15, 40).fillColor(gold).fill();
      doc.rect(727, 200, 15, 40).fillColor('#DAA520').fill();

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

      const placeFolder = `${place === 1 ? '1er' : place === 2 ? '2do' : '3er'}_Lugar_${project.projectName.replace(/[^a-zA-Z0-9]/g, '_')}`;

      for (const student of students) {
        const studentName = `${student.name} ${student.lastName}`;
        const pdfBuffer = await generateDiplomaPDF(
          studentName,
          place,
          project.projectName,
          `San Salvador, ${fecha}`
        );

        const fileName = `${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
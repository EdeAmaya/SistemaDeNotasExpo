import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Funciones auxiliares
const getLevelName = (level) => {
  if (level === 1) return 'Tercer Ciclo';
  if (level === 2) return 'Bachillerato';
  return 'Nivel no definido';
};

const getSpecificLevel = (level) => {
  if (!level) return null;
  let levelName = level.levelName || level.name || 'Especialidad no definida';
  levelName = levelName.replace(/bachillerato/i, '').trim();
  return levelName || 'Especialidad no definida';
};

// ============================================
// PDF 1: Notas por Proyecto (Agrupado)
// ============================================
export const generateProjectGroupedPDF = (projectScores, students, filterData, institutionInfo = {}) => {
  try {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 20;

    // ENCABEZADO
    if (institutionInfo?.logo) {
      try {
        doc.addImage(institutionInfo.logo, 'PNG', margin, yPos, 25, 25);
      } catch (e) {
        console.log('No se pudo cargar el logo:', e);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INSTITUTO TÉCNICO RICALDONE', pageWidth / 2, yPos + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('REPORTE DE CALIFICACIONES POR PROYECTO', pageWidth / 2, yPos + 12, { align: 'center' });

    const currentYear = new Date().getFullYear();
    doc.setFontSize(10);
    doc.text(`PROYECTO TÉCNICO CIENTÍFICO ${currentYear}`, pageWidth / 2, yPos + 18, { align: 'center' });

    yPos += 30;

    // Información de filtros
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    const filterInfo = [];
    if (filterData.level) {
      const baseLevel = getLevelName(filterData.level);
      filterInfo.push(`Nivel: ${baseLevel}`);
    }
    if (filterData.levelId) {
      const specificLevel = getSpecificLevel(filterData.levelId);
      if (specificLevel) filterInfo.push(`Grado: ${specificLevel}`);
    }
    if (filterData.specialty) {
      filterInfo.push(`Especialidad: ${filterData.specialty}`);
    }
    if (filterData.section) {
      filterInfo.push(`Sección: ${filterData.section}`);
    }

    if (filterInfo.length > 0) {
      doc.text(filterInfo.join(' | '), margin, yPos);
      yPos += 8;
    }

    // Agrupar estudiantes por proyecto
    const projectGroups = {};
    
    projectScores.forEach(score => {
      const projectId = score.projectId._id || score.projectId;
      const projectName = score.projectId.projectName || 'Proyecto sin nombre';
      
      if (!projectGroups[projectId]) {
        projectGroups[projectId] = {
          projectName,
          students: [],
          projectScore: score
        };
      }
      
      // Buscar estudiantes asignados a este proyecto
      const projectStudents = students.filter(s => {
        const studentProjectId = s.projectId?._id || s.projectId;
        return studentProjectId && studentProjectId.toString() === projectId.toString();
      });
      
      projectGroups[projectId].students = projectStudents;
    });

    // Generar tabla por cada proyecto
    Object.values(projectGroups).forEach((group, index) => {
      if (index > 0) {
        yPos += 10; // Espacio entre proyectos
      }

      // Verificar espacio en página
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      // Título del proyecto
      doc.setFillColor(75, 85, 99);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`PROYECTO: ${group.projectName}`, margin + 3, yPos + 5.5);
      doc.setTextColor(0, 0, 0);

      yPos += 10;

      // Información del proyecto
      const projectInfo = [
        ['Nota Final Global', (group.projectScore.notaFinalGlobal || 0).toFixed(2)],
        ['Promedio Interno', (group.projectScore.promedioInterno || 0).toFixed(2)],
        ['Promedio Externo', (group.projectScore.promedioExterno || 0).toFixed(2)],
        ['Total Evaluaciones', (group.projectScore.totalEvaluaciones || 0).toString()]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: projectInfo,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', fillColor: [229, 231, 235] },
          1: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 5;

      // Tabla de estudiantes del proyecto
      const studentsHead = [['#', 'CÓDIGO', 'NOMBRE COMPLETO', 'NIVEL/GRADO', 'SECCIÓN']];
      const studentsBody = group.students.map((student, idx) => [
        (idx + 1).toString(),
        (student.studentCode || 'N/A').toString(),
        `${student.name || ''} ${student.lastName || ''}`.trim() || 'N/A',
        student.idLevel?.levelName || 'N/A',
        student.idSection?.name || 'N/A'
      ]);

      if (studentsBody.length === 0) {
        studentsBody.push([
          { content: 'No hay estudiantes asignados a este proyecto', colSpan: 5, styles: { halign: 'center', fontStyle: 'italic' } }
        ]);
      }

      autoTable(doc, {
        startY: yPos,
        head: studentsHead,
        body: studentsBody,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [229, 231, 235],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 70 },
          3: { cellWidth: 35 },
          4: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY;
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} | Generado: ${new Date().toLocaleDateString('es-ES')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`Notas_Por_Proyecto_${Date.now()}.pdf`);

  } catch (error) {
    console.error('Error al generar PDF por proyecto:', error);
    throw error;
  }
};

// ============================================
// PDF 2: Listado de Todos los Estudiantes
// ============================================
export const generateAllStudentsPDF = (students, projectScores, filterData, institutionInfo = {}) => {
  try {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 20;

    // ENCABEZADO
    if (institutionInfo?.logo) {
      try {
        doc.addImage(institutionInfo.logo, 'PNG', margin, yPos, 25, 25);
      } catch (e) {
        console.log('No se pudo cargar el logo:', e);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INSTITUTO TÉCNICO RICALDONE', pageWidth / 2, yPos + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('LISTADO GENERAL DE CALIFICACIONES', pageWidth / 2, yPos + 12, { align: 'center' });

    const currentYear = new Date().getFullYear();
    doc.setFontSize(10);
    doc.text(`PROYECTO TÉCNICO CIENTÍFICO ${currentYear}`, pageWidth / 2, yPos + 18, { align: 'center' });

    yPos += 30;

    // Información de filtros
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    const filterInfo = [];
    if (filterData.level) {
      const baseLevel = getLevelName(filterData.level);
      filterInfo.push(`Nivel: ${baseLevel}`);
    }
    if (filterData.levelId) {
      const specificLevel = getSpecificLevel(filterData.levelId);
      if (specificLevel) filterInfo.push(`Grado: ${specificLevel}`);
    }
    if (filterData.specialty) {
      filterInfo.push(`Especialidad: ${filterData.specialty}`);
    }
    if (filterData.section) {
      filterInfo.push(`Sección: ${filterData.section}`);
    }

    if (filterInfo.length > 0) {
      doc.text(filterInfo.join(' | '), margin, yPos);
      yPos += 8;
    }

    // Crear mapa de projectId -> projectScore
    const projectScoreMap = {};
    projectScores.forEach(score => {
      const projectId = score.projectId._id || score.projectId;
      projectScoreMap[projectId] = score;
    });

    // Preparar datos de estudiantes
    const studentsHead = [['#', 'CÓDIGO', 'NOMBRE COMPLETO', 'PROYECTO', 'NOTA FINAL', 'PROM. INT.', 'PROM. EXT.']];
    const studentsBody = students.map((student, idx) => {
      let notaFinal = 'N/A';
      let promInterno = 'N/A';
      let promExterno = 'N/A';
      let projectName = 'Sin proyecto';

      if (student.projectId) {
        const projectId = (typeof student.projectId === 'object' 
          ? student.projectId._id 
          : student.projectId) || '';
        
        if (typeof student.projectId === 'object' && student.projectId.projectName) {
          projectName = student.projectId.projectName;
        }

        const projectScore = projectScoreMap[projectId];
        if (projectScore) {
          notaFinal = (projectScore.notaFinalGlobal || 0).toFixed(2);
          promInterno = (projectScore.promedioInterno || 0).toFixed(2);
          promExterno = (projectScore.promedioExterno || 0).toFixed(2);
        }
      }

      return [
        (idx + 1).toString(),
        (student.studentCode || 'N/A').toString(),
        `${student.name || ''} ${student.lastName || ''}`.trim() || 'N/A',
        projectName,
        notaFinal,
        promInterno,
        promExterno
      ];
    });

    // Tabla principal
    autoTable(doc, {
      startY: yPos,
      head: studentsHead,
      body: studentsBody,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [75, 85, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 50 },
        3: { cellWidth: 50 },
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' }
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        // Pie de página en cada página
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(
          `Página ${currentPage} de ${pageCount} | Generado: ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    // Resumen estadístico al final
    yPos = doc.lastAutoTable.finalY + 10;

    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RESUMEN ESTADÍSTICO', margin, yPos);
    yPos += 5;

    const totalStudents = students.length;
    const studentsWithProjects = students.filter(s => s.projectId).length;
    const studentsWithoutProjects = totalStudents - studentsWithProjects;

    // Calcular promedio general
    const validScores = Object.values(projectScoreMap)
      .map(score => score.notaFinalGlobal || 0)
      .filter(nota => nota > 0);
    
    const promedioGeneral = validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : 'N/A';

    const summaryData = [
      ['Total de Estudiantes', totalStudents.toString()],
      ['Estudiantes con Proyecto', studentsWithProjects.toString()],
      ['Estudiantes sin Proyecto', studentsWithoutProjects.toString()],
      ['Promedio General', promedioGeneral]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: summaryData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [229, 231, 235] },
        1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    doc.save(`Listado_Estudiantes_${Date.now()}.pdf`);

  } catch (error) {
    console.error('Error al generar PDF de estudiantes:', error);
    throw error;
  }
};
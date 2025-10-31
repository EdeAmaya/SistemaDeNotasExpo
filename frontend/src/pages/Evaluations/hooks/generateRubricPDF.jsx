// Hook para generar un PDF de la rúbrica utilizando jsPDF y jsPDF-AutoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Funciones auxiliares
const getStageName = (stage) => {
  if (!stage) return 'No asignada';
  return stage.stageName || stage.name || 'Etapa no definida';
};

// Obtiene el nombre del nivel
const getLevelName = (level) => {
  if (level === 1) return 'Tercer Ciclo';
  if (level === 2) return 'Bachillerato';
  return 'Nivel no definido';
};

// Obtiene el nombre específico del nivel (para Bachillerato)
const getSpecificLevel = (level) => {
  if (!level) return null;
  let levelName = level.levelName || level.name || 'Especialidad no definida';
  levelName = levelName.replace(/bachillerato/i, '').trim();
  return levelName || 'Especialidad no definida';
};

// Función principal para generar el PDF de la rúbrica
export const generateRubricPDF = (rubric, institutionInfo = {}) => {
  try {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 20;

    // ENCABEZADO
    // Logo a la izquierda (si existe)
    if (institutionInfo?.logo) {
      try {
        doc.addImage(institutionInfo.logo, 'PNG', margin, yPos, 25, 25);
      } catch (e) {
        console.log('No se pudo cargar el logo:', e);
      }
    }

    // Centro: INSTITUTO TÉCNICO RICALDONE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INSTITUTO TÉCNICO RICALDONE', pageWidth / 2, yPos + 5, { align: 'center' });

    // INSTRUMENTO DE EVALUACIÓN + stageName
    let stageName = getStageName(rubric.stageId);
    if (stageName === "Evaluación Externa") {
      stageName = "Externa";
    }
    stageName = stageName.toUpperCase();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`INSTRUMENTO DE EVALUACIÓN ${stageName}`, pageWidth / 2, yPos + 12, { align: 'center' });

    // PROYECTO TÉCNICO CIENTÍFICO + año
    const currentYear = new Date().getFullYear();
    doc.setFontSize(10);
    doc.text(`PROYECTO TÉCNICO CIENTÍFICO ${currentYear}`, pageWidth / 2, yPos + 18, { align: 'center' });

    // Nivel + Especialidad
    const baseLevel = getLevelName(rubric.level);
    let levelName = '';
    let specialtyName = '';

    if (baseLevel === 'Tercer Ciclo') {
      levelName = baseLevel.toUpperCase();
    } else if (baseLevel === 'Bachillerato') {
      const specificLevel = rubric.levelId ? getSpecificLevel(rubric.levelId) : '';
      specialtyName = rubric.specialtyId?.specialtyName
        ? rubric.specialtyId.specialtyName.toUpperCase()
        : '';

      levelName = specificLevel
        ? `${specificLevel.toUpperCase()} ${specialtyName}`.trim()
        : specialtyName;
    }

    // Texto de nivel y especialidad centrado
    const levelSpecialtyText = levelName;

    doc.setFillColor(229, 231, 235);
    doc.rect(margin + 30, yPos + 20, pageWidth - 2 * margin - 60, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(levelSpecialtyText, pageWidth / 2, yPos + 25, { align: 'center' });

    yPos += 35;

    // TABLA DE INFORMACIÓN
    const tableWidth = pageWidth - 2 * margin;

    const colWidths = {
      0: 30,
      1: 0.5 * (tableWidth - 30 - 25 - 50),
      2: 25,
      3: tableWidth - 30 - 25 - 0.5 * (tableWidth - 30 - 25 - 50)
    };

    // Datos de la tabla
    const tableData = [
      [
        { content: 'PROYECTO:', styles: { fillColor: [229, 231, 235], fontStyle: 'bold' } },
        { content: ' ', colSpan: 3 }
      ],
      [
        { content: 'CURSO:', styles: { fillColor: [229, 231, 235], fontStyle: 'bold' } },
        { content: ' ', styles: { cellWidth: colWidths[1] } },
        { content: 'FECHA:', styles: { fillColor: [229, 231, 235], fontStyle: 'bold' } },
        { content: ' ', styles: { cellWidth: colWidths[3] } }
      ],
      [
        { content: 'EVALUADOR:', styles: { fillColor: [229, 231, 235], fontStyle: 'bold' } },
        { content: ' ', styles: { cellWidth: colWidths[1] } },
        { content: 'ID:', styles: { fillColor: [229, 231, 235], fontStyle: 'bold' } },
        { content: ' ', styles: { cellWidth: colWidths[3] } }
      ]
    ];

    // Generar la tabla
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        halign: 'left',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: colWidths[0] },
        1: { cellWidth: colWidths[1] },
        2: { cellWidth: colWidths[2] },
        3: { cellWidth: colWidths[3] }
      },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // TABLA DE ESCALA DE REFERENCIA (solo para scaleType === 2)
    if (rubric.scaleType === 2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ESCALA DE REFERENCIA:', margin, yPos);
      yPos += 5;

      // Datos de la escala
      const scaleData = [
        ['No se verifica\n0', 'Regular\n1-4', 'Bueno\n5-6', 'Muy Bueno\n7-8', 'Excelente\n9-10']
      ];

      // Generar la tabla de escala
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: scaleData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
          fillColor: [243, 244, 246],
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 8;
    }

    // ENCABEZADO DE CRITERIOS (común para todos)
    doc.setFillColor(75, 85, 99);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PRESENTACIÓN Y DEFENSA DEL PTC', pageWidth / 2, yPos + 6.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    yPos += 15;

    // TABLA DE CRITERIOS SEGÚN scaleType o rubricType
    if (rubric.rubricType === 2 || rubric.scaleType === 1) {
      // Promedio: #, CRITERIO, PUNTUACIÓN
      const criteriaHead = [['#', 'CRITERIO', 'PUNTUACIÓN']];
      const criteriaBody = rubric.criteria.map((criterion, index) => [
        (index + 1).toString(),
        criterion.criterionName,
        ''
      ]);

      // Generar la tabla de criterios
      autoTable(doc, {
        startY: yPos,
        head: criteriaHead,
        body: criteriaBody,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
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
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: pageWidth - 2 * margin - 15 - 30 },
          2: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

    } else if (rubric.scaleType === 2) {
      // Escala de ejecución: #, CRITERIO, PORCENTAJE, DESCRIPCIÓN, VALORACIÓN
      const criteriaHead = [['#', 'CRITERIO', '%', 'DESCRIPCIÓN DEL CRITERIO', 'VALORACIÓN\n(PUNTAJE)']];
      const criteriaBody = rubric.criteria.map((criterion, index) => [
        (index + 1).toString(),
        criterion.criterionName,
        `${criterion.criterionWeight || 0}%`,
        criterion.criterionDescription || '',
        ''
      ]);

      // Generar la tabla de criterios
      autoTable(doc, {
        startY: yPos,
        head: criteriaHead,
        body: criteriaBody,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          valign: 'middle'
        },
        headStyles: {
          fillColor: [229, 231, 235],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: pageWidth - 2 * margin - 10 - 45 - 15 - 25 },
          4: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

    } else if (rubric.scaleType === 3) {
      // Desempeño por criterios      
      // Verificar si algún criterio tiene weight con value 2
      const hasDeficiente = rubric.criteria.some(criterion => {
        const weights = criterion.weights || [];
        const weight2 = weights.find(w => w.value === 2);
        return weight2 && weight2.description;
      });

      // Construir encabezado: CRITERIO, EXCELENTE 10, BUENO 8, etc.
      const headerRow = hasDeficiente 
        ? ['CRITERIO', 'EXCELENTE\n10', 'BUENO\n8', 'REGULAR\n6', 'NECESITA MEJORAR\n4', 'DEFICIENTE\n2']
        : ['CRITERIO', 'EXCELENTE\n10', 'BUENO\n8', 'REGULAR\n6', 'NECESITA MEJORAR\n4'];

      // Construir filas del body (una fila por cada criterio)
      const tableBody = rubric.criteria.map(criterion => {
        const weights = criterion.weights || [];
        const weight10 = weights.find(w => w.value === 10);
        const weight8 = weights.find(w => w.value === 8);
        const weight6 = weights.find(w => w.value === 6);
        const weight4 = weights.find(w => w.value === 4);
        const weight2 = weights.find(w => w.value === 2);

        // Fila para el criterio actual
        const row = [
          `${criterion.criterionName.toUpperCase()}\n${criterion.criterionWeight || 0}%`,
          weight10?.description || '',
          weight8?.description || '',
          weight6?.description || '',
          weight4?.description || ''
        ];

        // Agregar columna DEFICIENTE solo si existe globalmente
        if (hasDeficiente) {
          row.push(weight2?.description || '');
        }

        return row;
      });

      // Calcular ancho de columnas
      const numColumns = hasDeficiente ? 6 : 5;
      const firstColWidth = 40; // Ancho para la columna CRITERIO
      const remainingWidth = pageWidth - 2 * margin - firstColWidth;
      const otherColWidth = remainingWidth / (numColumns - 1);

      // Definir estilos de columnas
      const columnStyles = {
        0: { cellWidth: firstColWidth, halign: 'center', valign: 'middle', fontStyle: 'bold' }
      };

      // Asignar anchos a las demás columnas
      for (let i = 1; i < numColumns; i++) {
        columnStyles[i] = { cellWidth: otherColWidth, halign: 'left', valign: 'top' };
      }

      // Generar la tabla de criterios
      autoTable(doc, {
        startY: yPos,
        head: [headerRow],
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [229, 231, 235],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        columnStyles: columnStyles,
        margin: { left: margin, right: margin }
      });
    }

    // FOOTER AL FINAL DEL DOCUMENTO
    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);

    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos;

    // Verificar si hay espacio suficiente, si no agregar nueva página
    const currentY = yPos;
    const spaceNeeded = 50;
    if (currentY > pageHeight - spaceNeeded - 15) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = pageHeight - spaceNeeded;
    }

    // Sección de Observaciones (izquierda) y Firma (derecha)
    const middleX = pageWidth / 2;
    const footerStartY = yPos;

    // OBSERVACIONES (izquierda)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('OBSERVACIONES:', margin, footerStartY);
    
    // Recuadro para observaciones
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, footerStartY + 3, middleX - margin - 5, 30);

    // FIRMA (derecha)
    doc.text('FIRMA DEL EVALUADOR:', middleX + 5, footerStartY);
    
    // Línea para la firma
    const signatureY = footerStartY + 25;
    doc.line(middleX + 5, signatureY, pageWidth - margin, signatureY);

    // Guardar el PDF
    doc.save(`Rubrica_${rubric.rubricName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta nuevamente.');
  }
};
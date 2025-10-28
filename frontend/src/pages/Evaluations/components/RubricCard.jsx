import React from "react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClipboardList, Award, BookOpen, Calendar, Edit2, Trash2, FileText, CheckCircle, Layers, GraduationCap, Target, Download } from 'lucide-react';

const RubricCard = ({ rubric, deleteRubric, updateRubric, viewMode = 'list', institutionInfo = {} }) => {

  // Función para descargar pdf
  const handleDownloadPDF = () => {
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

      // Si el stageName es "Evaluación Externa", mostrar solo "EXTERNA"
      if (stageName === "Evaluación Externa") {
        stageName = "Externa";
      }

      // Convertir a mayúsculas
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

      // TABLA DE ESCALA DE REFERENCIA (si scaleType === 2 o rubricType === 2)
      if (rubric.scaleType === 2 || rubric.rubricType === 2) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('ESCALA DE REFERENCIA:', margin, yPos);
        yPos += 5;

        const scaleData = [
          ['No se verifica\n0', 'Regular\n1-4', 'Bueno\n5-6', 'Muy Bueno\n7-8', 'Excelente\n9-10']
        ];

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

      // ENCABEZADO DE CRITERIOS
      doc.setFillColor(75, 85, 99);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PRESENTACIÓN Y DEFENSA DEL PTC', pageWidth / 2, yPos + 6.5, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      yPos += 15;

      // TABLA DE CRITERIOS SEGÚN scaleType
      if (rubric.scaleType === 1) {
        // Promedio: #, CRITERIO, PUNTUACIÓN
        const criteriaHead = [['#', 'CRITERIO', 'PUNTUACIÓN']];
        const criteriaBody = rubric.criteria.map((criterion, index) => [
          (index + 1).toString(),
          criterion.criterionName,
          ''
        ]);

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

      } else if (rubric.scaleType === 2 || rubric.rubricType === 2) {
        // Escala de ejecución: #, CRITERIO, PORCENTAJE, DESCRIPCIÓN, VALORACIÓN
        const criteriaHead = [['#', 'CRITERIO', '%', 'DESCRIPCIÓN DEL CRITERIO', 'VALORACIÓN\n(PUNTAJE)']];
        const criteriaBody = rubric.criteria.map((criterion, index) => [
          (index + 1).toString(),
          criterion.criterionName,
          `${criterion.criterionWeight || 0}%`,
          criterion.criterionDescription || '',
          ''
        ]);

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
        // Desempeño por criterios - MODIFICADO: mostrar escalas solo en encabezado
        rubric.criteria.forEach((criterion, index) => {
          // Verificar si necesitamos una nueva página
          if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
          }

          // Obtener las descripciones de weights
          const weights = criterion.weights || [];
          const weight10 = weights.find(w => w.value === 10);
          const weight8 = weights.find(w => w.value === 8);
          const weight6 = weights.find(w => w.value === 6);
          const weight4 = weights.find(w => w.value === 4);
          const weight2 = weights.find(w => w.value === 2);

          const hasWeight2 = weight2 && weight2.description;

          // CRITERIO y PONDERACIÓN
          doc.setFillColor(243, 244, 246);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(criterion.criterionName, margin + 2, yPos + 4);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(`Ponderación: ${criterion.criterionWeight || 0}%`, margin + 2, yPos + 8);

          yPos += 10;

          // Solo encabezados de niveles (sin los valores numéricos)
          const headers = hasWeight2
            ? [['EXCELENTE', 'BUENO', 'REGULAR', 'NECESITA\nMEJORAR', 'DEFICIENTE']]
            : [['EXCELENTE', 'BUENO', 'REGULAR', 'NECESITA\nMEJORAR']];

          // Descripciones
          const descriptions = hasWeight2
            ? [[
              weight10?.description || '',
              weight8?.description || '',
              weight6?.description || '',
              weight4?.description || '',
              weight2?.description || ''
            ]]
            : [[
              weight10?.description || '',
              weight8?.description || '',
              weight6?.description || '',
              weight4?.description || ''
            ]];

          autoTable(doc, {
            startY: yPos,
            head: headers,
            body: descriptions,
            theme: 'grid',
            styles: {
              fontSize: 7,
              cellPadding: 2,
              lineColor: [0, 0, 0],
              lineWidth: 0.1,
              valign: 'top'
            },
            headStyles: {
              fillColor: [229, 231, 235],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              halign: 'center',
              valign: 'middle',
              minCellHeight: 10
            },
            columnStyles: hasWeight2 ? {
              0: { cellWidth: (pageWidth - 2 * margin) / 5 },
              1: { cellWidth: (pageWidth - 2 * margin) / 5 },
              2: { cellWidth: (pageWidth - 2 * margin) / 5 },
              3: { cellWidth: (pageWidth - 2 * margin) / 5 },
              4: { cellWidth: (pageWidth - 2 * margin) / 5 }
            } : {
              0: { cellWidth: (pageWidth - 2 * margin) / 4 },
              1: { cellWidth: (pageWidth - 2 * margin) / 4 },
              2: { cellWidth: (pageWidth - 2 * margin) / 4 },
              3: { cellWidth: (pageWidth - 2 * margin) / 4 }
            },
            margin: { left: margin, right: margin }
          });

          yPos = doc.lastAutoTable.finalY + 8;
        });
      }

      // FOOTER AL FINAL DEL DOCUMENTO (solo en la última página)
      const pageCount = doc.internal.getNumberOfPages();
      doc.setPage(pageCount);

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
      
      // Texto debajo de la línea
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Nombre y firma', middleX + 5 + (pageWidth - margin - middleX - 5) / 2, signatureY + 4, { align: 'center' });

      // Numeración de páginas en el pie
      const finalPageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      for (let i = 1; i <= finalPageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${finalPageCount} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Guardar el PDF
      doc.save(`Rubrica_${rubric.rubricName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  // Función para eliminar
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la rúbrica "${rubric.rubricName}"?`)) {
      deleteRubric(rubric._id);
    }
  };

  // Para editar
  const handleEdit = () => {
    updateRubric(rubric);
  };

  // Funciones para mostrar la info de la card
  const getStageName = (stage) => {
    if (!stage) return 'No asignada';
    return stage.stageName || stage.name || 'Etapa no definida';
  };

  const getSpecialtyName = (specialty) => {
    if (!specialty) return null;
    return specialty.specialtyName || specialty.name || 'Especialidad no definida';
  };

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

  const getRubricTypeName = (type) => {
    if (type === 1) return 'Escala Estimativa';
    if (type === 2) return 'Rúbrica';
    return 'Tipo no definido';
  };

  const getCriteriaCount = () => {
    return rubric.criteria?.length || 0;
  };

  const getRubricTypeColor = (type) => {
    if (type === 1) return 'bg-purple-600';
    if (type === 2) return 'bg-purple-600';
    return 'from-gray-500 via-gray-600 to-gray-700';
  };

  const getRubricTypeIcon = (type) => {
    if (type === 1) return <Target className="w-3 h-3" />;
    if (type === 2) return <CheckCircle className="w-3 h-3" />;
    return <ClipboardList className="w-3 h-3" />;
  };

  // Vista de Lista (Horizontal)
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getRubricTypeColor(rubric.rubricType)}`}></div>

        <div className="pl-4 pr-5 py-4">
          <div className="flex items-center gap-5">
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getRubricTypeColor(rubric.rubricType)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <ClipboardList className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-gray-700">{getCriteriaCount()}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                  {rubric.rubricName}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${getRubricTypeColor(rubric.rubricType)} text-white rounded-lg text-xs font-bold shadow-sm`}>
                  {getRubricTypeIcon(rubric.rubricType)}
                  <span>{getRubricTypeName(rubric.rubricType)}</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{getLevelName(rubric.level)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Año {rubric.year}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Layers className="w-4 h-4" />
                  <span className="font-medium">{getStageName(rubric.stageId)}</span>
                </div>
                {rubric.specialtyId && (
                  <div className="flex items-center gap-1.5 text-purple-600">
                    <Award className="w-4 h-4" />
                    <span className="font-medium text-xs">{getSpecialtyName(rubric.specialtyId)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-purple-600">
                  <FileText className={`w-5 h-5 ${getCriteriaCount() > 0 ? 'text-purple-600' : 'text-orange-600'}`} />
                  <span className="font-medium text-xs">{getCriteriaCount()} criterios</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="cursor-pointer px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Descargar PDF"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  <span className="hidden xl:inline">PDF</span>
                </span>
              </button>

              <button
                onClick={handleEdit}
                className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Editar rúbrica"
              >
                <span className="flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Editar</span>
                </span>
              </button>

              <button
                onClick={handleDelete}
                className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Eliminar rúbrica"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Eliminar</span>
                </span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-500 font-medium">Etapa:</span>
                <span className="text-gray-700 font-bold">{getStageName(rubric.stageId)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-500 font-medium">Nivel:</span>
                <span className="text-gray-700 font-bold">{getLevelName(rubric.level)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-gray-500 font-medium">Tipo:</span>
                <span className="text-gray-700 font-bold">{getRubricTypeName(rubric.rubricType)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`h-0.5 bg-gradient-to-r ${getRubricTypeColor(rubric.rubricType)} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid)
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      <div className={`relative bg-gradient-to-r ${getRubricTypeColor(rubric.rubricType)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <ClipboardList className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-1">{rubric.rubricName}</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
              {getRubricTypeIcon(rubric.rubricType)}
              {getRubricTypeName(rubric.rubricType)}
            </div>
          </div>

          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-xl font-black text-gray-800">{getCriteriaCount()}</div>
              <div className="text-[8px] font-bold text-gray-600 -mt-1">criterios</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <GraduationCap className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Nivel</div>
            <div className="text-sm font-bold">{getLevelName(rubric.level)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Año</div>
            <div className="text-sm font-bold">{rubric.year}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Layers className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Etapa</div>
            <div className="text-sm font-bold">{getStageName(rubric.stageId)}</div>
          </div>
        </div>

        {rubric.specialtyId && (
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">Especialidad</div>
              <div className="text-sm font-bold">{getSpecialtyName(rubric.specialtyId)}</div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${getCriteriaCount() > 0 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <FileText className={`w-5 h-5 ${getCriteriaCount() > 0 ? 'text-gray-600' : 'text-orange-600'}`} />
          <div className="flex-1">
            <div className={`text-xs font-semibold ${getCriteriaCount() > 0 ? 'text-gray-500' : 'text-orange-600'}`}>
              {getCriteriaCount() > 0 ? 'Criterios de Evaluación' : 'Sin Criterios'}
            </div>
            <div className={`text-sm font-bold ${getCriteriaCount() > 0 ? 'text-gray-600' : 'text-orange-800'}`}>
              {getCriteriaCount() > 0 ? `${getCriteriaCount()} criterios definidos` : 'No hay criterios asignados'}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDownloadPDF}
            className="cursor-pointer flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleEdit}
            className="cursor-pointer flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </button>

          <button
            onClick={handleDelete}
            className="cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">ETAPA</div>
              <div className="text-xs font-black text-gray-800">{getStageName(rubric.stageId)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">NIVEL</div>
              <div className="text-xs font-black text-gray-800">{getLevelName(rubric.level)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">TIPO</div>
              <div className="text-xs font-black text-gray-800">{getRubricTypeName(rubric.rubricType)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`h-2 bg-gradient-to-r ${getRubricTypeColor(rubric.rubricType)}`}></div>
    </div>
  );
};

export default RubricCard;
import React from "react";
import { ClipboardList, Award, Calendar, Edit2, Trash2, FileText, CheckCircle, Layers, GraduationCap, Target, Download } from 'lucide-react';
import { generateRubricPDF } from '../hooks/generateRubricPDF'; // Función para generar el PDF

const RubricCard = ({ rubric, deleteRubric, updateRubric, viewMode = 'list', institutionInfo = {} }) => {

  // Función para descargar pdf
  const handleDownloadPDF = () => {
    generateRubricPDF(rubric, institutionInfo);
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
import React from 'react';
import { Edit2, Trash2, Award, BookOpen, ClipboardList, Calendar, User, Target, GraduationCap, Layers } from 'lucide-react';

const GradeCard = ({ grade, deleteGrade, editGrade, viewMode = 'list' }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la evaluación del proyecto "${grade.projectId?.projectName}"?`)) {
      deleteGrade(grade._id);
    }
  };

  const getNotaFinal = () => {
    return grade.notaFinal || 0;
  };

  const getStageName = (rubric) => {
    if (!rubric?.stageId) return 'Sin etapa';
    const stage = rubric.stageId;
    return stage.name || stage.stageName || 'Etapa no definida';
  };

  const getSpecialtyName = (rubric) => {
    if (!rubric?.specialtyId) return 'Sin especialidad';
    const specialty = rubric.specialtyId;
    return specialty.specialtyName || specialty.name || 'Especialidad no definida';
  };

  const getLevelName = (level) => {
    if (level === 1) return 'Tercer Ciclo';
    if (level === 2) return 'Bachillerato';
    return 'Nivel no definido';
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'bg-yellow-500';
    if (score >= 7) return 'bg-yellow-500';
    if (score >= 5) return 'bg-yellow-600';
    return 'bg-yellow-700';
  };

  const notaFinal = getNotaFinal();

  // Vista de Lista (Horizontal)
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        {/* Barra lateral colorida */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getScoreColor(notaFinal)}`}></div>
        
        <div className="pl-4 pr-5 py-4">
          <div className="flex items-center gap-5">
            {/* Avatar con icono */}
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getScoreColor(notaFinal)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Award className="w-8 h-8 text-white" />
              {/* Indicador de nota */}
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-gray-700">{notaFinal.toFixed(1)}</span>
              </div>
            </div>

            {/* Información de la evaluación */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                  {grade.projectId?.projectName || 'Proyecto sin nombre'}
                </h3>
                {/* Badge de nota */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${getScoreColor(notaFinal)} text-white rounded-lg text-xs font-bold shadow-sm`}>
                  <Award className="w-3 h-3" />
                  <span>Nota: {notaFinal.toFixed(2)}</span>
                </span>
              </div>

              {/* Info académica */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{getLevelName(grade.rubricId?.level)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Layers className="w-4 h-4" />
                  <span className="font-medium">{getStageName(grade.rubricId)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-yellow-600">
                  <Target className="w-4 h-4" />
                  <span className="font-medium text-xs">{grade.criteriosEvaluados?.length || 0} criterios</span>
                </div>
                {grade.fecha && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">{new Date(grade.fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => editGrade(grade)}
                className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Editar evaluación"
              >
                <span className="flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Editar</span>
                </span>
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Eliminar evaluación"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Eliminar</span>
                </span>
              </button>
            </div>
          </div>

          {/* Footer con información adicional */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-500 font-medium">Rúbrica:</span>
                <span className="text-gray-700 font-bold">{grade.rubricId?.rubricName || 'Sin rúbrica'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-500 font-medium">Etapa:</span>
                <span className="text-gray-700 font-bold">{getStageName(grade.rubricId)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-500 font-medium">Tipo Cálculo:</span>
                <span className="text-gray-700 font-bold">{grade.tipoCalculo === 'ponderado' ? 'Ponderado' : 'Promedio'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso inferior en hover */}
        <div className={`h-0.5 bg-gradient-to-r ${getScoreColor(notaFinal)} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid)
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Header con gradiente */}
      <div className={`relative bg-gradient-to-r ${getScoreColor(notaFinal)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-1">{grade.projectId?.projectName || 'Sin proyecto'}</h3>
          </div>
          {/* Badge de nota */}
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-800">{notaFinal.toFixed(1)}</div>
              <div className="text-[8px] font-bold text-gray-600 -mt-1">NOTA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body del card */}
      <div className="p-6 space-y-4">
        {/* Rúbrica */}
        <div className="flex items-center gap-2 text-gray-700">
          <ClipboardList className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Rúbrica</div>
            <div className="text-sm font-bold">{grade.rubricId?.rubricName || 'Sin rúbrica'}</div>
          </div>
        </div>

        {/* Nivel */}
        <div className="flex items-center gap-2 text-gray-700">
          <GraduationCap className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Nivel</div>
            <div className="text-sm font-bold">{getLevelName(grade.rubricId?.level)}</div>
          </div>
        </div>

        {/* Etapa */}
        <div className="flex items-center gap-2 text-gray-700">
          <Layers className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Etapa</div>
            <div className="text-sm font-bold">{getStageName(grade.rubricId)}</div>
          </div>
        </div>

        {/* Criterios Evaluados */}
        <div className="flex items-center gap-2 text-gray-700">
          <Target className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Criterios Evaluados</div>
            <div className="text-sm font-bold">{grade.criteriosEvaluados?.length || 0} criterios</div>
          </div>
        </div>

        {/* Fecha de evaluación */}
        {grade.fecha && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">Fecha de Evaluación</div>
              <div className="text-sm font-bold">{new Date(grade.fecha).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</div>
            </div>
          </div>
        )}

        {/* Nota Final destacada */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-50 border-2 border-yellow-200`}>
          <Award className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-yellow-600">Nota Final</div>
            <div className="text-sm font-bold text-yellow-800">{notaFinal.toFixed(2)} / 10.0</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => editGrade(grade)}
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

      {/* Footer con información adicional */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">ETAPA</div>
              <div className="text-xs font-black text-gray-800">{getStageName(grade.rubricId)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">NIVEL</div>
              <div className="text-xs font-black text-gray-800">{getLevelName(grade.rubricId?.level)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">CÁLCULO</div>
              <div className="text-xs font-black text-gray-800">{grade.tipoCalculo === 'ponderado' ? 'Ponderado' : 'Promedio'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className={`h-2 bg-gradient-to-r ${getScoreColor(notaFinal)}`}></div>
    </div>
  );
};

export default GradeCard;
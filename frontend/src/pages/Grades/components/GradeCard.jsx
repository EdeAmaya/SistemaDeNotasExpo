import React from 'react';
import { Edit2, Trash2, Award, BookOpen, ClipboardList, Calendar, User, Target } from 'lucide-react';

const GradeCard = ({ grade, deleteGrade, editGrade, viewMode = 'list' }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la evaluación del proyecto "${grade.projectId?.projectName}"?`)) {
      deleteGrade(grade._id);
    }
  };

  const calculateTotalScore = () => {
    return grade.criteriosEvaluados?.reduce((sum, criterio) => {
      return sum + (criterio.puntajeObtenido || 0);
    }, 0) || 0;
  };

  const totalScore = calculateTotalScore();

  const getScoreColor = (score) => {
    if (score >= 9) return 'from-green-500 to-green-600';
    if (score >= 7) return 'from-blue-500 to-blue-600';
    if (score >= 5) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getScoreColor(totalScore)}`}></div>
        
        <div className="pl-4 pr-5 py-4 flex items-center gap-5">
          <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getScoreColor(totalScore)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Award className="w-8 h-8 text-white" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
              <span className="text-xs font-black text-gray-700">{totalScore.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                {grade.projectId?.projectName || 'Proyecto sin nombre'}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{grade.projectId?.studentId?.name || 'Sin estudiante'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <ClipboardList className="w-4 h-4" />
                <span className="font-medium">{grade.rubricId?.rubricName || 'Sin rúbrica'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600">
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

          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => editGrade(grade)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      <div className={`relative bg-gradient-to-r ${getScoreColor(totalScore)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <BookOpen className="w-10 h-10 mb-3" />
            <h3 className="text-xl font-black mb-1">{grade.projectId?.projectName || 'Sin proyecto'}</h3>
            <p className="text-sm opacity-90">{grade.projectId?.studentId?.name || 'Sin estudiante'}</p>
          </div>
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-800">{totalScore.toFixed(1)}</div>
              <div className="text-[8px] font-bold text-gray-600 -mt-1">NOTA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Rúbrica</div>
            <div className="text-sm font-bold">{grade.rubricId?.rubricName || 'Sin rúbrica'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Target className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Criterios Evaluados</div>
            <div className="text-sm font-bold">{grade.criteriosEvaluados?.length || 0} criterios</div>
          </div>
        </div>

        {grade.fecha && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xs text-gray-500 font-semibold">Fecha</div>
              <div className="text-sm font-bold">{new Date(grade.fecha).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => editGrade(grade)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className={`h-2 bg-gradient-to-r ${getScoreColor(totalScore)}`}></div>
    </div>
  );
};

export default GradeCard;
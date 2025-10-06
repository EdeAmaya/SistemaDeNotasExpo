import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Award,
  BookOpen,
  Target,
  Users,
  UserCheck
} from 'lucide-react';

const GradeCard = ({ project, viewMode = 'list', onViewDetails }) => {
  
  // Navegar a vista de detalles del proyecto
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project.projectId);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'bg-yellow-500';
    if (score >= 7) return 'bg-yellow-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-yellow-500';
  };

  const getScoreGradient = (score) => {
    if (score >= 9) return 'bg-yellow-500';
    if (score >= 7) return 'bg-yellow-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-yellow-500';
  };

  const promedioTotal = project.promedioTotal || 0;
  const promedioInterno = project.promedioInterno || 0;
  const promedioExterno = project.promedioExterno || 0;

  // ================================
  // Vista LISTA (Horizontal)
  // ================================
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getScoreGradient(promedioTotal)}`}></div>

        <div className="pl-4 pr-5 py-4">
          <div className="flex items-center gap-5">
            {/* Badge de nota */}
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${getScoreGradient(promedioTotal)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Award className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-gray-700">{promedioTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Información del proyecto */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-yellow-500 transition-colors">
                  {project.projectName}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r ${getScoreGradient(promedioTotal)} text-white rounded-lg text-xs font-bold shadow-sm`}>
                  <Award className="w-3 h-3" />
                  <span>Promedio: {promedioTotal.toFixed(5)}</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">{project.totalEvaluaciones} evaluaciones</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{project.evaluacionesInternas?.length || 0} internas</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-600">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-medium">{project.evaluacionesExternas?.length || 0} externas</span>
                </div>
              </div>

              {/* Promedios */}
              <div className="mt-3 flex gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold shadow-sm">
                  <Users className="w-4 h-4" />
                  <span>Interno: {promedioInterno.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-semibold shadow-sm">
                  <UserCheck className="w-4 h-4" />
                  <span>Externo: {promedioExterno.toFixed(3)}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black shadow-sm text-white bg-gradient-to-r ${getScoreGradient(promedioTotal)}`}>
                  <Award className="w-4 h-4" />
                  <span>Total: {promedioTotal.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Botón Ver Detalles */}
            <div className="flex-shrink-0">
              <button
                onClick={handleViewDetails}
                className="cursor-pointer px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Ver detalles del proyecto"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span className="hidden xl:inline">Ver Detalles</span>
                </span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-500 font-medium">Evaluaciones Internas:</span>
                <span className="text-gray-700 font-bold">{project.evaluacionesInternas?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-gray-500 font-medium">Evaluaciones Externas:</span>
                <span className="text-gray-700 font-bold">{project.evaluacionesExternas?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${getScoreColor(promedioTotal)}`}></div>
                <span className="text-gray-500 font-medium">Total Evaluaciones:</span>
                <span className="text-gray-700 font-bold">{project.totalEvaluaciones}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`h-0.5 bg-gradient-to-r ${getScoreGradient(promedioTotal)} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // ================================
  // Vista GRID (Tarjetas)
  // ================================
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      <div className={`relative bg-gradient-to-r ${getScoreGradient(promedioTotal)} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-1 line-clamp-2">{project.projectName}</h3>
          </div>
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-800">{promedioTotal.toFixed(2)}</div>
              <div className="text-[8px] font-bold text-gray-600 -mt-1">TOTAL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Target className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Total Evaluaciones</div>
            <div className="text-sm font-bold">{project.totalEvaluaciones} evaluaciones</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Evaluaciones Internas</div>
            <div className="text-sm font-bold">{project.evaluacionesInternas?.length || 0} evaluaciones</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <UserCheck className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 font-semibold">Evaluaciones Externas</div>
            <div className="text-sm font-bold">{project.evaluacionesExternas?.length || 0} evaluaciones</div>
          </div>
        </div>

        {/* Promedios en grid */}
        <div className="pt-2">
          <div className="text-xs text-gray-500 font-semibold mb-2">Promedios de Notas</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-2 text-center">
              <div className="text-[10px] font-semibold text-blue-600 mb-1">Interno</div>
              <div className="text-lg font-bold text-blue-800">
                {promedioInterno.toFixed(5)}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-2 text-center">
              <div className="text-[10px] font-semibold text-purple-600 mb-1">Externo</div>
              <div className="text-lg font-bold text-purple-800">
                {promedioExterno.toFixed(5)}
              </div>
            </div>
            <div className={`bg-gradient-to-br ${getScoreGradient(promedioTotal)} rounded-lg px-2 py-2 text-center shadow-md`}>
              <div className="text-[10px] font-semibold text-white mb-1">Total</div>
              <div className="text-lg font-black text-white">
                {promedioTotal.toFixed(5)}
              </div>
            </div>
          </div>
        </div>

        {/* Botón Ver Detalles */}
        <button
          onClick={handleViewDetails}
          className="cursor-pointer w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          <span>Ver Detalles</span>
        </button>
      </div>

      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">INTERNAS</div>
              <div className="text-xs font-black text-gray-800">{project.evaluacionesInternas?.length || 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">EXTERNAS</div>
              <div className="text-xs font-black text-gray-800">{project.evaluacionesExternas?.length || 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold mb-0.5">TOTAL</div>
              <div className="text-xs font-black text-gray-800">{project.totalEvaluaciones}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`h-2 bg-gradient-to-r ${getScoreGradient(promedioTotal)}`}></div>
    </div>
  );
};

export default GradeCard;
import React from "react";
import { Lightbulb, BookOpen, FileText, Globe, Calendar, Edit2, Trash2, CheckCircle, XCircle, Hash, ExternalLink } from 'lucide-react';

const ProjectCard = ({ project, deleteProject, updateProject, viewMode = 'list' }) => {
  
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el proyecto ${project.projectName}?`)) {
      deleteProject(project._id);
    }
  };

  const handleEdit = () => {
    updateProject(project);
  };

  const getLevelName = (level) => {
    if (!level) return 'No asignado';
    return level.name || level.levelName || 'Nivel no definido';
  };

  const getSectionName = (section) => {
    if (!section) return 'No asignada';
    return section.name || section.sectionName || 'Sección no definida';
  };

  const openGoogleSite = () => {
    if (project.googleSitesLink) {
      window.open(project.googleSitesLink, '_blank');
    }
  };

  // Vista de Lista (Horizontal) - Responsive
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        
        {/* Barra lateral colorida */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${
          project.status === 'Activo'
            ? 'bg-gradient-to-b from-green-500 via-green-600 to-green-700'
            : 'bg-gradient-to-b from-red-500 via-red-600 to-red-700'
        }`}></div>
        
        <div className="pl-3 sm:pl-4 pr-3 sm:pr-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          
          {/* Avatar con icono */}
          <div className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${
            project.status === 'Activo'
              ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700'
              : 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
          } flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto`}>
            <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            
            {/* Indicador de estado */}
            {project.status === 'Activo' ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            )}
          </div>

          {/* Información del proyecto */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {project.projectName}
              </h3>
              
              {/* Badge de ID */}
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-800 rounded-lg text-[10px] sm:text-xs font-bold shadow-sm">
                <Hash className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span>{project.projectId}</span>
              </span>

              {/* Badge de estado */}
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-sm ${
                project.status === 'Activo'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {project.status === 'Activo' ? (
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <XCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                )}
                <span className="hidden xs:inline">{project.status}</span>
              </span>
            </div>

            {/* Info académica */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-medium truncate">{getLevelName(project.idLevel)}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-medium truncate">{getSectionName(project.idSection)}</span>
              </div>
              {project.googleSitesLink && (
                <div className="flex items-center gap-1 sm:gap-1.5 text-purple-600">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium text-[10px] sm:text-xs">Sitio Web</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción - Responsive */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
            {project.googleSitesLink && (
              <button
                onClick={openGoogleSite}
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
                title="Ver sitio web"
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline">Ver Sitio</span>
                </span>
              </button>
            )}
            
            <button
              onClick={handleEdit}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Editar proyecto"
            >
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Editar</span>
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Eliminar proyecto"
            >
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Eliminar</span>
              </span>
            </button>
          </div>
        </div>

        {/* Barra de progreso inferior en hover */}
        <div className={`h-0.5 ${
          project.status === 'Activo'
            ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'
            : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
        } transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid) - Responsive
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      
      {/* Header con gradiente */}
      <div className={`relative ${
        project.status === 'Activo'
          ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'
          : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
      } p-4 sm:p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 sm:mb-3">
              <Lightbulb className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-base sm:text-xl font-black mb-1 line-clamp-2">{project.projectName}</h3>
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] sm:text-xs font-bold">
              <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {project.projectId}
            </div>
          </div>
          
          {/* Badge de estado */}
          {project.status === 'Activo' ? (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Body del card */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        
        {/* Nivel */}
        <div className="flex items-center gap-2 text-gray-700">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold">Nivel</div>
            <div className="text-xs sm:text-sm font-bold truncate">{getLevelName(project.idLevel)}</div>
          </div>
        </div>

        {/* Sección */}
        <div className="flex items-center gap-2 text-gray-700">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold">Sección</div>
            <div className="text-xs sm:text-sm font-bold truncate">{getSectionName(project.idSection)}</div>
          </div>
        </div>

        {/* Sitio Web */}
        {project.googleSitesLink ? (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-purple-50 border-2 border-purple-200">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-xs text-purple-600 font-semibold">Sitio Web</div>
              <div className="text-xs sm:text-sm font-bold text-purple-800">Disponible</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-50 border-2 border-gray-200">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-xs text-gray-500 font-semibold">Sitio Web</div>
              <div className="text-xs sm:text-sm font-bold text-gray-600">Sin enlace</div>
            </div>
          </div>
        )}

        {/* Estado */}
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg ${
          project.status === 'Activo'
            ? 'bg-green-50 border-2 border-green-200'
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            project.status === 'Activo' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs sm:text-sm font-bold ${
            project.status === 'Activo' ? 'text-green-700' : 'text-red-700'
          }`}>
            {project.status === 'Activo' ? 'Proyecto Activo' : 'Proyecto Inactivo'}
          </span>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-medium">
            Creado el {new Date(project.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2">
          {project.googleSitesLink && (
            <button
              onClick={openGoogleSite}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ver Sitio Web</span>
            </button>
          )}
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Editar</span>
            </button>
            
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className={`h-2 ${
        project.status === 'Activo'
          ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'
          : 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
      }`}></div>
    </div>
  );
};

export default ProjectCard;
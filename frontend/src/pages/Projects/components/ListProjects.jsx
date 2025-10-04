import React, { useState } from "react";
import { Search, X, List, LayoutGrid, Lightbulb, CheckCircle, XCircle, Globe, BookOpen, Plus, AlertCircle } from 'lucide-react';
import ProjectCard from "./ProjectCard";

const ListProjects = ({ projects, loading, deleteProject, updateProject }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = project.projectName.toLowerCase().includes(searchLower) ||
                         project.projectId.toLowerCase().includes(searchLower) ||
                         (project.idLevel?.name && project.idLevel.name.toLowerCase().includes(searchLower)) ||
                         (project.idSection?.name && project.idSection.name.toLowerCase().includes(searchLower));
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'active' && project.status === 'Activo') ||
      (activeFilter === 'inactive' && project.status === 'Inactivo') ||
      (activeFilter === 'withLink' && project.googleSitesLink);
    
    return matchesSearch && matchesFilter;
  });

  const getStats = () => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'Activo').length,
    inactive: projects.filter(p => p.status === 'Inactivo').length,
    withLink: projects.filter(p => p.googleSitesLink).length
  });

  const stats = getStats();

  const filterButtons = [
    { key: 'all', label: 'Todos', shortLabel: 'Todos', icon: BookOpen, gradient: 'from-gray-500 to-gray-700' },
    { key: 'active', label: 'Activos', shortLabel: 'Activos', icon: CheckCircle, gradient: 'from-green-500 to-green-700' },
    { key: 'inactive', label: 'Inactivos', shortLabel: 'Inactivos', icon: XCircle, gradient: 'from-red-500 to-red-700' },
    { key: 'withLink', label: 'Con Sitio Web', shortLabel: 'Con Sitio', icon: Globe, gradient: 'from-purple-500 to-purple-700' }
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      
      {/* Barra de herramientas - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4">
        
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all text-xs sm:text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selector de vista */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg self-end">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Filtros - Responsive con scroll horizontal */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filterButtons.map(filter => {
          const IconComponent = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`group relative overflow-hidden transition-all duration-300 flex-shrink-0 ${
                activeFilter === filter.key ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap ${
                activeFilter === filter.key
                  ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
              }`}>
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.shortLabel}</span>
                <div className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-black ${
                  activeFilter === filter.key
                    ? 'bg-white/30 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {stats[filter.key]}
                </div>
              </div>
              
              {activeFilter === filter.key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información de resultados - Responsive */}
      {!loading && filteredProjects.length > 0 && (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{filteredProjects.length}</span>
            <span className="text-gray-600">
              {filteredProjects.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">
                {projects.filter(p => p.status === 'Activo').length} activos
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 font-medium">
                {projects.filter(p => p.googleSitesLink).length} con sitio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading - Responsive */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-bold text-base sm:text-lg">Cargando proyectos</p>
            <p className="text-gray-500 text-xs sm:text-sm">Un momento por favor...</p>
          </div>
        </div>
      )}

      {/* Empty State - Responsive */}
      {!loading && (!projects || projects.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2 px-4">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">No hay proyectos registrados</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md">
              Comienza creando el primer proyecto del sistema
            </p>
          </div>
        </div>
      )}

      {/* No Results - Responsive */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4 sm:space-y-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
          </div>
          <div className="text-center space-y-2 px-4">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Sin resultados</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md">
              No encontramos proyectos que coincidan con tu búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="mt-4 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de proyectos - Responsive */}
      {!loading && filteredProjects.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4' 
          : 'space-y-2 sm:space-y-3'
        }>
          {filteredProjects.map((project, index) => (
            <div
              key={project._id}
              className="animate-fadeIn"
              style={{ 
                animationDelay: `${index * 0.03}s`,
                animationFillMode: 'both'
              }}
            >
              <ProjectCard
                project={project}
                deleteProject={deleteProject}
                updateProject={updateProject}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ListProjects;
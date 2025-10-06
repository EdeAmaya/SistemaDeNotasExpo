import React, { useState } from "react";
import { Search, X, List, LayoutGrid, Lightbulb, CheckCircle, XCircle, Globe, BookOpen, Plus, AlertCircle, Filter, Award } from 'lucide-react';
import ProjectCard from "./ProjectCard";

const ListProjects = ({ projects, loading, deleteProject, updateProject, levels, sections, specialties }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  
  // Filtros académicos
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showAcademicFilters, setShowAcademicFilters] = useState(false);

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
    
    // Filtros académicos
    const matchesLevel = !selectedLevel || 
      (project.idLevel?._id === selectedLevel || project.idLevel === selectedLevel);
    
    const matchesSection = !selectedSection || 
      (project.idSection?._id === selectedSection || project.idSection === selectedSection);
    
    const matchesSpecialty = !selectedSpecialty || 
      (project.idSpecialty?._id === selectedSpecialty || project.idSpecialty === selectedSpecialty);
    
    return matchesSearch && matchesFilter && matchesLevel && matchesSection && matchesSpecialty;
  });

  const getStats = () => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'Activo').length,
    inactive: projects.filter(p => p.status === 'Inactivo').length,
    withLink: projects.filter(p => p.googleSitesLink).length
  });

  const stats = getStats();

  const filterButtons = [
    { key: 'all', label: 'Todos', icon: BookOpen, color: 'bg-gray-600' },
    { key: 'active', label: 'Activos', icon: CheckCircle, color: 'bg-blue-600' },
    { key: 'inactive', label: 'Inactivos', icon: XCircle, color: 'bg-blue-600' },
    { key: 'withLink', label: 'Con Sitio Web', icon: Globe, color: 'bg-blue-600' }
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSelectedLevel('');
    setSelectedSection('');
    setSelectedSpecialty('');
  };

  const hasActiveAcademicFilters = selectedLevel || selectedSection || selectedSpecialty;

  return (
    <div className="p-6 space-y-6">
      
      {/* Barra de herramientas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Búsqueda */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar proyectos por nombre, código, nivel o sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selector de vista */}
        <div className="flex items-center gap-2">
          {/* Botón de filtros académicos */}
          <button
            onClick={() => setShowAcademicFilters(!showAcademicFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer border-2 ${
              showAcademicFilters || hasActiveAcademicFilters
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveAcademicFilters && (
              <span className="bg-blue-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {[selectedLevel, selectedSection, selectedSpecialty].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Vista */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros académicos */}
      {showAcademicFilters && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Filtros Académicos</h3>
            </div>
            {hasActiveAcademicFilters && (
              <button
                onClick={() => {
                  setSelectedLevel('');
                  setSelectedSection('');
                  setSelectedSpecialty('');
                }}
                className="text-sm text-red-600 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Filtro por Nivel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nivel Académico
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium cursor-pointer"
              >
                <option value="">Todos los niveles</option>
                {levels?.map(level => (
                  <option key={level._id} value={level._id}>
                    {level.levelName || level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Sección */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Sección
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium cursor-pointer"
              >
                <option value="">Todas las secciones</option>
                {sections?.map(section => (
                  <option key={section._id} value={section._id}>
                    {section.sectionName || section.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Especialidad */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Especialidad
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm font-medium cursor-pointer"
              >
                <option value="">Todas las especialidades</option>
                {specialties?.map(specialty => (
                  <option key={specialty._id} value={specialty._id}>
                    {specialty.specialtyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveAcademicFilters && (
            <div className="pt-4 border-t border-blue-200">
              <div className="flex flex-wrap gap-2">
                {selectedLevel && (
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {levels?.find(l => l._id === selectedLevel)?.levelName || levels?.find(l => l._id === selectedLevel)?.levelName}
                    <button
                      onClick={() => setSelectedLevel('')}
                      className="hover:bg-blue-600 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSection && (
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {sections?.find(s => s._id === selectedSection)?.sectionName || sections?.find(s => s._id === selectedSection)?.sectionName}
                    <button
                      onClick={() => setSelectedSection('')}
                      className="hover:bg-blue-600 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSpecialty && (
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {specialties?.find(sp => sp._id === selectedSpecialty)?.specialtyName}
                    <button
                      onClick={() => setSelectedSpecialty('')}
                      className="hover:bg-blue-600 rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {filterButtons.map(filter => {
          const IconComponent = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                activeFilter === filter.key ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                activeFilter === filter.key
                  ? `${filter.color} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
              }`}>
                <IconComponent className="w-5 h-5" />
                <span>{filter.label}</span>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
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

      {/* Información de resultados */}
      {!loading && filteredProjects.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{filteredProjects.length}</span>
            <span className="text-gray-600">
              {filteredProjects.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </span>
            {filteredProjects.length !== projects.length && (
              <span className="text-gray-500">
                (de {projects.length} totales)
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
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

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-bold text-lg">Cargando proyectos</p>
            <p className="text-gray-500 text-sm">Un momento por favor...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!projects || projects.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-16 h-16 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">No hay proyectos registrados</h3>
            <p className="text-gray-600 max-w-md">
              Comienza creando el primer proyecto del sistema
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Sin resultados</h3>
            <p className="text-gray-600 max-w-md">
              No encontramos proyectos que coincidan con tu búsqueda o filtros
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de proyectos */}
      {!loading && filteredProjects.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' 
          : 'space-y-3'
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ListProjects;
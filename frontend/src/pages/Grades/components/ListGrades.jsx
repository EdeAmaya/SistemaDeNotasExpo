import React, { useState } from 'react';
import { Search, List, LayoutGrid } from 'lucide-react';
import GradeCard from './GradeCard';

const ListGrades = ({ projectScores, loading, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredProjects = projectScores.filter((project) => {
    const projectName = project.projectName?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return projectName.includes(search);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Barra de búsqueda y botones de vista */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
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
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
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

      {/* Estados */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Cargando proyectos...</p>
          </div>
        </div>
      )}

      {!loading && filteredProjects.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredProjects.map((project) => (
            <GradeCard key={project.projectId} project={project} viewMode={viewMode} onViewDetails={() => onViewDetails(project.projectId)} />
          ))}
        </div>
      )}

      {!loading && projectScores.length === 0 && (
        <p className="text-center text-gray-500 py-24">No hay proyectos evaluados.</p>
      )}

      {!loading && projectScores.length > 0 && filteredProjects.length === 0 && (
        <p className="text-center text-gray-500 py-24">No se encontraron proyectos con los filtros aplicados.</p>
      )}
    </div>
  );
};

export default ListGrades;

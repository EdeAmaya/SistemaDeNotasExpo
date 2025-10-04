import React, { useState } from 'react';
import { Search, Grid, List as ListIcon } from 'lucide-react';
import GradeCard from './GradeCard';

const ListGrades = ({ rubrics, loading, deleteGrade, editGrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredGrades = rubrics.filter(grade =>
    grade.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.rubricId?.rubricName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.projectId?.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y vista */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por proyecto, estudiante o rúbrica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all"
          />
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-yellow-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-yellow-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista/Grid de evaluaciones */}
      {filteredGrades.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No hay evaluaciones registradas'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza asignando notas a los proyectos'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredGrades.map((grade) => (
            <GradeCard
              key={grade._id}
              grade={grade}
              deleteGrade={deleteGrade}
              editGrade={editGrade}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListGrades;
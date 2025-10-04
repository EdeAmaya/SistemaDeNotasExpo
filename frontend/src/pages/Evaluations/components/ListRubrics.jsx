import React, { useState } from "react";
import { List, LayoutGrid, CheckCircle, BookOpen } from 'lucide-react';
import RubricCard from "./RubricCard";

const ListRubrics = ({ rubrics, loading, deleteRubric, updateRubric }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  // Filtrado según búsqueda y tipo de rúbrica
  const filteredRubrics = rubrics.filter(rubric => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = rubric.rubricName.toLowerCase().includes(searchLower) ||
      rubric.level.toString().includes(searchLower) ||
      rubric.year.toString().includes(searchLower) ||
      (rubric.stageId?.stageName && rubric.stageId.stageName.toLowerCase().includes(searchLower)) ||
      (rubric.specialtyId?.specialtyName && rubric.specialtyId.specialtyName.toLowerCase().includes(searchLower));

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'escala' && rubric.rubricType === 1) ||
      (activeFilter === 'rubrica' && rubric.rubricType === 2);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    all: rubrics.length,
    escala: rubrics.filter(r => r.rubricType === 1).length,
    rubrica: rubrics.filter(r => r.rubricType === 2).length
  };

  const filterButtons = [
    { key: 'all', label: 'Todas', gradient: 'from-purple-500 to-purple-700' },
    { key: 'escala', label: 'Escalas Estimativas', gradient: 'from-purple-500 to-purple-700' },
    { key: 'rubrica', label: 'Rúbricas', gradient: 'from-purple-600 to-purple-800' }
  ];
  return (
    <div className="p-6 space-y-6">
      {/* Barra de búsqueda y vista */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar rúbricas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {filterButtons.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`group relative overflow-hidden transition-all duration-300 ${activeFilter === filter.key ? 'scale-105' : 'hover:scale-105'}`}
          >
            <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${activeFilter === filter.key ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg` : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'}`}>
              <span>{filter.label}</span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-black ${activeFilter === filter.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {stats[filter.key]}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lista de rúbricas */}
      {!loading && filteredRubrics.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredRubrics.map((rubric, index) => (
            <RubricCard
              key={rubric._id}
              rubric={rubric}
              deleteRubric={deleteRubric}
              updateRubric={updateRubric}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && rubrics.length === 0 && (
        <p className="text-center text-gray-500 py-24">No hay rúbricas registradas.</p>
      )}

      {/* No results */}
      {!loading && rubrics.length > 0 && filteredRubrics.length === 0 && (
        <p className="text-center text-gray-500 py-24">No se encontraron rúbricas con los filtros aplicados.</p>
      )}
    </div>
  );
};

export default ListRubrics;

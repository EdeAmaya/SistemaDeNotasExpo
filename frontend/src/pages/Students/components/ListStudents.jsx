import React, { useState } from "react";
import { Search, X, List, LayoutGrid, GraduationCap, Briefcase, Award, Users, UserPlus, AlertCircle } from 'lucide-react';
import StudentCard from "./StudentCard";

const ListStudents = ({ students, loading, deleteStudent, updateStudent }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = student.name.toLowerCase().includes(searchLower) ||
                         student.lastName.toLowerCase().includes(searchLower) ||
                         student.studentCode.toString().includes(searchLower) ||
                         (student.idLevel?.name && student.idLevel.name.toLowerCase().includes(searchLower)) ||
                         (student.idSection?.name && student.idSection.name.toLowerCase().includes(searchLower));
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'withProject' && student.projectId) ||
      (activeFilter === 'withoutProject' && !student.projectId) ||
      (activeFilter === 'withSpecialty' && student.idSpecialty);
    
    return matchesSearch && matchesFilter;
  });

  const getStats = () => ({
    all: students.length,
    withProject: students.filter(s => s.projectId).length,
    withoutProject: students.filter(s => !s.projectId).length,
    withSpecialty: students.filter(s => s.idSpecialty).length
  });

  const stats = getStats();

  const filterButtons = [
    { key: 'all', label: 'Todos', icon: Users, color: 'bg-gray-600' },
    { key: 'withProject', label: 'Con Proyecto', icon: Briefcase, color: 'bg-green-600' },
    { key: 'withoutProject', label: 'Sin Proyecto', icon: AlertCircle, color: 'bg-green-600' },
    { key: 'withSpecialty', label: 'Con Especialidad', icon: Award, color: 'bg-green-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Barra de herramientas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Búsqueda */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar estudiantes por nombre, apellido, código, nivel o sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-sm font-medium placeholder-gray-400"
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
      {!loading && filteredStudents.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{filteredStudents.length}</span>
            <span className="text-gray-600">
              {filteredStudents.length === 1 ? 'estudiante encontrado' : 'estudiantes encontrados'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">
                {students.filter(s => s.projectId).length} con proyecto
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 font-medium">
                {students.filter(s => s.idSpecialty).length} con especialidad
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-green-400 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-bold text-lg">Cargando estudiantes</p>
            <p className="text-gray-500 text-sm">Un momento por favor...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!students || students.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">No hay estudiantes registrados</h3>
            <p className="text-gray-600 max-w-md">
              Comienza creando el primer estudiante del sistema
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Sin resultados</h3>
            <p className="text-gray-600 max-w-md">
              No encontramos estudiantes que coincidan con tu búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {!loading && filteredStudents.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' 
          : 'space-y-3'
        }>
          {filteredStudents.map((student, index) => (
            <div
              key={student._id}
              className="animate-fadeIn"
              style={{ 
                animationDelay: `${index * 0.03}s`,
                animationFillMode: 'both'
              }}
            >
              <StudentCard
                student={student}
                deleteStudent={deleteStudent}
                updateStudent={updateStudent}
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
      `}</style>
    </div>
  );
};

export default ListStudents;

import React, { useState, useEffect } from 'react';
import { Search, List, LayoutGrid, Filter, X, Award, BookOpen, Target, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import GradeCard from './GradeCard';

const ListGrades = ({ projectScores, loading, onViewDetails, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  
  // Filtros académicos (solo para admin)
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showAcademicFilters, setShowAcademicFilters] = useState(false);
  
  // Filtros por rango de nota (solo para admin)
  const [selectedScoreRange, setSelectedScoreRange] = useState('all');

  // Estados para cargar datos
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const isAdmin = userRole === 'Administrador';

  // Cargar datos para filtros (solo si es admin)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchFilterData = async () => {
      setLoadingFilters(true);
      try {
        const token = localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          sessionStorage.getItem('token') ||
          sessionStorage.getItem('authToken');

        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const [levelsRes, sectionsRes, specialtiesRes] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { headers, credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/sections', { headers, credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { headers, credentials: 'include' })
        ]);

        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          setLevels(levelsData);
        }

        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json();
          setSections(sectionsData);
        }

        if (specialtiesRes.ok) {
          const specialtiesData = await specialtiesRes.json();
          setSpecialties(specialtiesData);
        }
      } catch (error) {
        console.error('Error al cargar datos de filtros:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, [isAdmin]);

  const filteredProjects = projectScores.filter((project) => {
    const projectName = project.projectName?.toLowerCase() || '';
    const teamNumber = project.teamNumber?.toString() || '';
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = projectName.includes(search) || teamNumber.includes(search);
    
    // Filtros académicos (solo aplican si es admin)
    const matchesLevel = !isAdmin || !selectedLevel || 
      (project.idLevel?._id === selectedLevel || project.idLevel === selectedLevel);
    
    const matchesSection = !isAdmin || !selectedSection || 
      (project.idSection?._id === selectedSection || project.idSection === selectedSection);
    
    const matchesSpecialty = !isAdmin || !selectedSpecialty || 
      (project.idSpecialty?._id === selectedSpecialty || project.idSpecialty === selectedSpecialty);
    
    // Filtro por rango de nota (solo aplica si es admin)
    const avgScore = project.averageScore || 0;
    const matchesScoreRange = !isAdmin ||
      selectedScoreRange === 'all' ||
      (selectedScoreRange === 'excellent' && avgScore >= 9) ||
      (selectedScoreRange === 'good' && avgScore >= 7 && avgScore < 9) ||
      (selectedScoreRange === 'regular' && avgScore >= 6 && avgScore < 7) ||
      (selectedScoreRange === 'low' && avgScore < 6);
    
    return matchesSearch && matchesLevel && matchesSection && matchesSpecialty && matchesScoreRange;
  });

  const getScoreStats = () => {
    const scores = projectScores.map(p => p.averageScore || 0);
    return {
      all: projectScores.length,
      excellent: projectScores.filter(p => (p.averageScore || 0) >= 9).length,
      good: projectScores.filter(p => (p.averageScore || 0) >= 7 && (p.averageScore || 0) < 9).length,
      regular: projectScores.filter(p => (p.averageScore || 0) >= 6 && (p.averageScore || 0) < 7).length,
      low: projectScores.filter(p => (p.averageScore || 0) < 6).length,
      average: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0.00'
    };
  };

  const stats = getScoreStats();

  const scoreRangeButtons = [
    { key: 'all', label: 'Todos', icon: BookOpen, color: 'bg-gray-600' },
    { key: 'excellent', label: 'Excelente (9-10)', icon: Award, color: 'bg-green-600' },
    { key: 'good', label: 'Bueno (7-9)', icon: Target, color: 'bg-blue-600' },
    { key: 'regular', label: 'Regular (6-7)', icon: TrendingUp, color: 'bg-yellow-600' },
    { key: 'low', label: 'Bajo (<6)', icon: AlertCircle, color: 'bg-red-600' }
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    if (isAdmin) {
      setSelectedLevel('');
      setSelectedSection('');
      setSelectedSpecialty('');
      setSelectedScoreRange('all');
    }
  };

  const hasActiveAcademicFilters = isAdmin && (selectedLevel || selectedSection || selectedSpecialty);
  const hasActiveFilters = hasActiveAcademicFilters || (isAdmin && selectedScoreRange !== 'all') || searchTerm;

  return (
    <div className="p-6 space-y-6">

      {/* Estadísticas rápidas - Solo para admin */}
      {isAdmin && !loading && projectScores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-blue-700">Total Proyectos</span>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-blue-900">{stats.all}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-green-700">Excelente</span>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-black text-green-900">{stats.excellent}</div>
            <div className="text-xs text-green-600 mt-1">≥ 9.0</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-blue-700">Bueno</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-blue-900">{stats.good}</div>
            <div className="text-xs text-blue-600 mt-1">7.0 - 8.9</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-yellow-700">Regular</span>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-black text-yellow-900">{stats.regular}</div>
            <div className="text-xs text-yellow-600 mt-1">6.0 - 6.9</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-purple-700">Promedio</span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-purple-900">{stats.average}</div>
            <div className="text-xs text-purple-600 mt-1">General</div>
          </div>
        </div>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Búsqueda */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar por nombre de proyecto o número de equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium placeholder-gray-400"
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
          {/* Botón de filtros académicos - Solo para admin */}
          {isAdmin && (
            <button
              onClick={() => setShowAcademicFilters(!showAcademicFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer border-2 ${
                showAcademicFilters || hasActiveAcademicFilters
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveAcademicFilters && (
                <span className="bg-purple-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                  {[selectedLevel, selectedSection, selectedSpecialty].filter(Boolean).length}
                </span>
              )}
            </button>
          )}

          {/* Vista */}
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
      </div>

      {/* Panel de filtros académicos - Solo para admin */}
      {isAdmin && showAcademicFilters && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
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

          {loadingFilters ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando filtros...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Filtro por Nivel */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nivel Académico
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium cursor-pointer"
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
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium cursor-pointer"
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
                <div className="pt-4 border-t border-purple-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedLevel && (
                      <span className="inline-flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {levels?.find(l => l._id === selectedLevel)?.levelName || levels?.find(l => l._id === selectedLevel)?.name}
                        <button
                          onClick={() => setSelectedLevel('')}
                          className="hover:bg-purple-600 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSection && (
                      <span className="inline-flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {sections?.find(s => s._id === selectedSection)?.sectionName || sections?.find(s => s._id === selectedSection)?.name}
                        <button
                          onClick={() => setSelectedSection('')}
                          className="hover:bg-purple-600 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSpecialty && (
                      <span className="inline-flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {specialties?.find(sp => sp._id === selectedSpecialty)?.specialtyName}
                        <button
                          onClick={() => setSelectedSpecialty('')}
                          className="hover:bg-purple-600 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Filtros por rango de calificación - Solo para admin */}
      {isAdmin && !loading && projectScores.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {scoreRangeButtons.map(filter => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => setSelectedScoreRange(filter.key)}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedScoreRange === filter.key ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                  selectedScoreRange === filter.key
                    ? `${filter.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:shadow-lg border-2 border-gray-200'
                }`}>
                  <IconComponent className="w-5 h-5" />
                  <span>{filter.label}</span>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    selectedScoreRange === filter.key
                      ? 'bg-white/30 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stats[filter.key]}
                  </div>
                </div>
                {selectedScoreRange === filter.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Información de resultados */}
      {!loading && filteredProjects.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{filteredProjects.length}</span>
            <span className="text-gray-600">
              {filteredProjects.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </span>
            {filteredProjects.length !== projectScores.length && (
              <span className="text-gray-500">
                (de {projectScores.length} totales)
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-semibold cursor-pointer flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-400 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-bold text-lg">Cargando calificaciones</p>
            <p className="text-gray-500 text-sm">Un momento por favor...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projectScores.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">No hay proyectos evaluados</h3>
            <p className="text-gray-600 max-w-md">
              Los proyectos evaluados aparecerán aquí con sus calificaciones
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && projectScores.length > 0 && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Sin resultados</h3>
            <p className="text-gray-600 max-w-md">
              No encontramos proyectos que coincidan con tu búsqueda{isAdmin ? ' o filtros' : ''}
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              Limpiar {isAdmin ? 'todos los filtros' : 'búsqueda'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de proyectos */}
      {!loading && filteredProjects.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredProjects.map((project, index) => (
            <div
              key={project.projectId}
              className="animate-fadeIn"
              style={{ 
                animationDelay: `${index * 0.03}s`,
                animationFillMode: 'both'
              }}
            >
              <GradeCard 
                project={project} 
                viewMode={viewMode} 
                onViewDetails={() => onViewDetails(project.projectId)} 
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

export default ListGrades;
import React, { useState, useEffect } from 'react';
import { Download, FileText, Users, Filter, Loader2, FolderKanban } from 'lucide-react';
import { generateProjectGroupedPDF, generateAllStudentsPDF } from '../hooks/generateGradesPDF';
import useLevels from '../hooks/useLevels';
import useSpecialties from '../hooks/useSpecialties';
import useSections from '../hooks/useSections';

const API_URL = 'https://stc-instituto-tecnico-ricaldone.onrender.com/api';

const DownloadReports = ({ projectScores, loading }) => {
  const [filters, setFilters] = useState({
    level: '',
    levelId: '',
    specialtyId: '',
    sectionId: ''
  });

  const { levels } = useLevels();
  const { specialties } = useSpecialties();
  const { sections } = useSections();
  const [students, setStudents] = useState([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(null);

  // Cargar estudiantes cuando cambien los filtros
  useEffect(() => {
    if (filters.level || filters.levelId || filters.specialtyId || filters.sectionId) {
      loadStudents();
    }
  }, [filters]);

  const loadStudents = async () => {
    try {
      setLoadingData(true);
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.levelId) params.append('levelId', filters.levelId);
      if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
      if (filters.sectionId) params.append('sectionId', filters.sectionId);

      const queryString = params.toString();
      const url = `${API_URL}/students${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Error al obtener estudiantes');
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setStudents([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFilteredProjectScores = () => {
    let filtered = [...projectScores];

    if (filters.level) {
      filtered = filtered.filter(ps => ps.nivel === parseInt(filters.level));
    }

    if (filters.levelId) {
      filtered = filtered.filter(ps => 
        ps.projectId?.levelId?._id === filters.levelId ||
        ps.projectId?.levelId === filters.levelId
      );
    }

    if (filters.specialtyId) {
      filtered = filtered.filter(ps => 
        ps.projectId?.specialtyId?._id === filters.specialtyId ||
        ps.projectId?.specialtyId === filters.specialtyId
      );
    }

    if (filters.sectionId) {
      filtered = filtered.filter(ps => 
        ps.projectId?.sectionId?._id === filters.sectionId ||
        ps.projectId?.sectionId === filters.sectionId
      );
    }

    return filtered;
  };

  const getFilteredStudents = () => {
    return students;
  };

  const handleGeneratePDF = async (type) => {
    try {
      setGeneratingPDF(type);

      const filteredProjectScores = getFilteredProjectScores();
      const filteredStudents = getFilteredStudents();

      if (filteredProjectScores.length === 0) {
        alert('No hay proyectos evaluados con los filtros seleccionados');
        return;
      }

      const filterData = {
        level: filters.level ? parseInt(filters.level) : null,
        levelId: levels.find(l => l._id === filters.levelId),
        specialty: specialties.find(s => s._id === filters.specialtyId)?.specialtyName,
        section: sections.find(s => s._id === filters.sectionId)?.name
      };

      if (type === 'project') {
        generateProjectGroupedPDF(
          filteredProjectScores,
          filteredStudents,
          filterData,
          {} // institutionInfo - puedes agregar logo aquí si lo tienes
        );
      } else if (type === 'students') {
        generateAllStudentsPDF(
          filteredStudents,
          filteredProjectScores,
          filterData,
          {}
        );
      }

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const filteredProjectScores = getFilteredProjectScores();
  const filteredStudents = getFilteredStudents();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Descargar Reportes de Calificaciones</h2>
        <p className="text-gray-600">Genera reportes en PDF con las calificaciones de los proyectos</p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Nivel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nivel
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Todos los niveles</option>
              <option value="1">Tercer Ciclo</option>
              <option value="2">Bachillerato</option>
            </select>
          </div>

          {/* Grado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grado
            </label>
            <select
              value={filters.levelId}
              onChange={(e) => handleFilterChange('levelId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Todos los grados</option>
              {levels.map(level => (
                <option key={level._id} value={level._id}>
                  {level.levelName}
                </option>
              ))}
            </select>
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especialidad
            </label>
            <select
              value={filters.specialtyId}
              onChange={(e) => handleFilterChange('specialtyId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty._id} value={specialty._id}>
                  {specialty.specialtyName}
                </option>
              ))}
            </select>
          </div>

          {/* Sección */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={filters.sectionId}
              onChange={(e) => handleFilterChange('sectionId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Todas las secciones</option>
              {sections.map(section => (
                <option key={section._id} value={section._id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de filtros */}
        {(filters.level || filters.levelId || filters.specialtyId || filters.sectionId) && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <div className="text-sm text-gray-700">
                <span className="font-bold">Resultados:</span> {filteredProjectScores.length} proyectos evaluados, {filteredStudents.length} estudiantes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opciones de descarga */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PDF por Proyectos */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-gray-900 mb-2">
                Reporte por Proyectos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Genera un PDF con las calificaciones agrupadas por proyecto. Muestra la información del proyecto y los estudiantes asignados.
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                  <span>Nota final global del proyecto</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                  <span>Promedios interno y externo</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                  <span>Lista de estudiantes por proyecto</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={() => handleGeneratePDF('project')}
            disabled={generatingPDF || loading || filteredProjectScores.length === 0}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPDF === 'project' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar PDF por Proyectos</span>
              </>
            )}
          </button>
        </div>

        {/* PDF por Estudiantes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-gray-900 mb-2">
                Listado de Estudiantes
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Genera un PDF con el listado completo de estudiantes y sus calificaciones. Ideal para registros académicos.
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Listado completo de estudiantes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Notas finales y promedios</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Resumen estadístico general</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={() => handleGeneratePDF('students')}
            disabled={generatingPDF || loading || filteredStudents.length === 0}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPDF === 'students' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar Listado de Estudiantes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-xl">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Información sobre los reportes</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                • Los reportes se generan en formato PDF y se descargan automáticamente en tu dispositivo.
              </p>
              <p>
                • Puedes aplicar filtros para generar reportes específicos por nivel, grado, especialidad o sección.
              </p>
              <p>
                • Si no seleccionas ningún filtro, se generará el reporte con todos los datos disponibles.
              </p>
              <p>
                • Los reportes incluyen el logo institucional y la fecha de generación.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {(loading || loadingData) && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando datos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadReports;
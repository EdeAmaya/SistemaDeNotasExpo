import React, { useState, useEffect } from 'react';
import { User, Hash, BookOpen, FileText, Award, Briefcase, Edit2, UserPlus, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const RegisterStudent = ({
  studentCode, setStudentCode,
  name, setName,
  lastName, setLastName,
  idLevel, setIdLevel,
  idSection, setIdSection,
  idSpecialty, setIdSpecialty,
  projectId, setProjectId,
  saveStudent,
  id,
  handleEdit,
  onCancel
}) => {

  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState({ isValid: null, message: '' });

  const isBachillerato = (levelName) => {
    if (!levelName) return false;
    const levelLower = levelName.toLowerCase();
    return levelLower.includes('1°') || levelLower.includes('2°') || levelLower.includes('3°') ||
      levelLower.includes('primer') || levelLower.includes('segundo') || levelLower.includes('tercer') ||
      levelLower.includes('bachillerato') || levelLower.includes('1') || levelLower.includes('2') || levelLower.includes('3');
  };

  const isBasica = (levelName) => {
    if (!levelName) return false;
    const levelLower = levelName.toLowerCase();
    return levelLower.includes('7°') || levelLower.includes('8°') || levelLower.includes('9°') ||
      levelLower.includes('séptimo') || levelLower.includes('octavo') || levelLower.includes('noveno') ||
      levelLower.includes('7') || levelLower.includes('8') || levelLower.includes('9');
  };

  const getFilteredSections = () => {
    if (!idLevel) return sections;

    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) return sections;

    const levelName = selectedLevel.name || selectedLevel.levelName || '';

    if (isBachillerato(levelName)) {
      return sections.filter(section => {
        const sectionName = (section.name || section.sectionName || '').toLowerCase();
        return /[123][ab]/.test(sectionName) ||
          sectionName.includes('1a') || sectionName.includes('1b') ||
          sectionName.includes('2a') || sectionName.includes('2b') ||
          sectionName.includes('3a') || sectionName.includes('3b');
      });
    } else if (isBasica(levelName)) {
      return sections.filter(section => {
        const sectionName = (section.name || section.sectionName || '').toLowerCase().trim();
        return /^[abcdef]$/.test(sectionName) &&
          !sectionName.includes('1') &&
          !sectionName.includes('2') &&
          !sectionName.includes('3');
      });
    }

    return sections;
  };

  const requiresSpecialty = () => {
    if (!idLevel) return false;
    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) return false;

    const levelName = selectedLevel.name || selectedLevel.levelName || '';
    return isBachillerato(levelName);
  };

  const getFilteredProjects = () => {
    // Si no hay nivel, no mostrar proyectos
    if (!idLevel) return [];
    
    // Si no hay sección, no mostrar proyectos
    if (!idSection) return [];
    
    // Si requiere especialidad pero no está seleccionada, no mostrar proyectos
    if (requiresSpecialty() && !idSpecialty) return [];

    return projects.filter(project => {
      // Verificar que el proyecto tenga nivel y sección
      const projectLevelId = project.idLevel?._id || project.idLevel;
      const projectSectionId = project.idSection?._id || project.idSection;
      
      // Debe coincidir nivel y sección
      const matchesLevel = projectLevelId === idLevel;
      const matchesSection = projectSectionId === idSection;

      // Si no es bachillerato (es básica), solo verificar nivel y sección
      if (!requiresSpecialty()) {
        return matchesLevel && matchesSection;
      }

      // Si es bachillerato, debe tener especialidad seleccionada
      if (requiresSpecialty() && idSpecialty) {
        const projectSpecialtyId = project.selectedSpecialty?._id || project.selectedSpecialty;
        return matchesLevel && matchesSection && projectSpecialtyId === idSpecialty;
      }

      return false;
    });
  };

  // Función para determinar el mensaje del select de proyectos
  const getProjectSelectMessage = () => {
    if (!idLevel) {
      return 'Primero selecciona un nivel...';
    }
    
    if (!idSection) {
      return 'Primero selecciona una sección...';
    }
    
    if (requiresSpecialty() && !idSpecialty) {
      return 'Primero selecciona una especialidad...';
    }
    
    if (loadingData) {
      return 'Cargando proyectos...';
    }
    
    const filteredProjects = getFilteredProjects();
    if (filteredProjects.length === 0) {
      return 'No hay proyectos disponibles para esta combinación...';
    }
    
    return 'Selecciona un proyecto (opcional)...';
  };

  // Función para determinar si el select debe estar deshabilitado
  const isProjectSelectDisabled = () => {
    if (loadingData) return true;
    if (!idLevel) return true;
    if (!idSection) return true;
    if (requiresSpecialty() && !idSpecialty) return true;
    return false;
  };

  useEffect(() => {
    if (idLevel) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        const levelName = selectedLevel.name || selectedLevel.levelName || '';

        const currentSectionValid = getFilteredSections().some(section => section._id === idSection);
        if (!currentSectionValid) {
          setIdSection("");
        }

        if (!isBachillerato(levelName)) {
          setIdSpecialty("");
        }
      }
    }

    // Limpiar proyecto si ya no coincide con los filtros
    if (projectId) {
      const filteredProjects = getFilteredProjects();
      const projectStillValid = filteredProjects.some(project => project._id === projectId);
      if (!projectStillValid) {
        setProjectId("");
      }
    }
  }, [idLevel, idSection, idSpecialty, levels, sections, projects]);

  const checkStudentCodeUnique = async (code) => {
    if (!code || code.trim() === '') {
      setCodeValidation({ isValid: null, message: '' });
      return;
    }

    setIsCheckingCode(true);

    try {
      const response = await fetch(`https://stc-instituto-tecnico-ricaldone.onrender.com/api/students`, {
        credentials: 'include'
      });
      if (response.ok) {
        const allStudents = await response.json();

        const filteredStudents = id ?
          allStudents.filter(student => student._id !== id) :
          allStudents;

        const existingStudent = filteredStudents.find(
          student => student.studentCode.toString() === code.toString()
        );

        if (existingStudent) {
          setCodeValidation({
            isValid: false,
            message: `El código ${code} ya está asignado a ${existingStudent.name} ${existingStudent.lastName}`
          });
        } else {
          setCodeValidation({
            isValid: true,
            message: 'Código disponible'
          });
        }
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      setCodeValidation({
        isValid: null,
        message: 'Error al verificar código'
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (studentCode) {
        checkStudentCodeUnique(studentCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [studentCode, id]);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoadingData(true);
      setErrors({});

      try {
        const [levelsResponse, sectionsResponse, specialtiesResponse, projectsResponse] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/sections', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/projects', { credentials: 'include' })
        ]);

        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          setLevels(Array.isArray(levelsData) ? levelsData : []);
        } else {
          setErrors(prev => ({ ...prev, levels: 'Error al cargar niveles' }));
        }

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        } else {
          setErrors(prev => ({ ...prev, sections: 'Error al cargar secciones' }));
        }

        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json();
          setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        } else {
          setErrors(prev => ({ ...prev, specialties: 'Error al cargar especialidades' }));
        }

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(Array.isArray(projectsData) ? projectsData : []);
        } else {
          setErrors(prev => ({ ...prev, projects: 'Error al cargar proyectos' }));
        }

      } catch (error) {
        console.error('Error general cargando datos de catálogos:', error);
        setErrors({
          general: 'Error de conexión. Verifica que el servidor esté funcionando.'
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchCatalogData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (codeValidation.isValid === false) {
      alert('No se puede guardar: El código de estudiante ya existe');
      return;
    }

    if (id) {
      handleEdit(e);
    } else {
      saveStudent(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-xl ${id ? 'bg-green-600' : 'bg-green-600'
              } flex items-center justify-center shadow-lg`}
          >
            {id ? (
              <Edit2 className="w-6 h-6 text-white" />
            ) : (
              <UserPlus className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {id ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}
            </h2>
            <p className="text-sm text-gray-500">
              {id
                ? 'Actualiza la información del estudiante'
                : 'Completa los datos para registrar un nuevo estudiante'}
            </p>
          </div>
        </div>
      </div>

      {/* Mostrar errores */}
      {errors.general && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Información Personal */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>Información Personal</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Código */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>Código *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={studentCode || ''}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-4 transition-all text-gray-900 font-medium ${codeValidation.isValid === false
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                    : codeValidation.isValid === true
                      ? 'border-green-500 focus:border-green-600 focus:ring-green-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  placeholder="Ej: 202301001"
                  required
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {isCheckingCode ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : codeValidation.isValid === true ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : codeValidation.isValid === false ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              {codeValidation.message && (
                <p className={`mt-1 text-xs font-medium ${codeValidation.isValid === false ? 'text-red-600' :
                  codeValidation.isValid === true ? 'text-green-600' : 'text-gray-500'
                  }`}>
                  {codeValidation.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                placeholder="Ej: Juan"
                required
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={lastName || ''}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                placeholder="Ej: Pérez"
                required
              />
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>Información Académica</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Nivel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Nivel Académico *</span>
              </label>
              <select
                value={idLevel || ''}
                onChange={(e) => setIdLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                required
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? 'Cargando niveles...' : 'Seleccionar nivel...'}
                </option>
                {levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.levelName || level.name}
                  </option>
                ))}
              </select>
              {errors.levels && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.levels}
                </p>
              )}
            </div>

            {/* Sección */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Sección *</span>
              </label>
              <select
                value={idSection || ''}
                onChange={(e) => setIdSection(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                required
                disabled={loadingData || !idLevel}
              >
                <option value="">
                  {!idLevel
                    ? 'Primero selecciona un nivel...'
                    : loadingData
                      ? 'Cargando secciones...'
                      : 'Seleccionar sección...'}
                </option>
                {getFilteredSections().map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.sectionName || section.name}
                  </option>
                ))}
              </select>
              {errors.sections && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.sections}
                </p>
              )}
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>Especialidad {requiresSpecialty() && '*'}</span>
              </label>
              <select
                value={idSpecialty || ''}
                onChange={(e) => setIdSpecialty(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 transition-all text-gray-900 font-medium ${requiresSpecialty()
                  ? 'bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  }`}
                disabled={loadingData || !requiresSpecialty()}
                required={requiresSpecialty()}
              >
                <option value="">
                  {!requiresSpecialty()
                    ? 'No disponible para este nivel...'
                    : loadingData
                      ? 'Cargando especialidades...'
                      : 'Seleccionar especialidad...'}
                </option>
                {requiresSpecialty() && specialties.map((specialty) => (
                  <option key={specialty._id} value={specialty._id}>
                    {specialty.name || specialty.specialtyName}
                  </option>
                ))}
              </select>
              {!requiresSpecialty() && idLevel && (
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Solo para bachillerato
                </p>
              )}
            </div>

            {/* Proyecto */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>Proyecto (Opcional)</span>
              </label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-4 transition-all text-gray-900 font-medium ${
                  isProjectSelectDisabled()
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                disabled={isProjectSelectDisabled()}
              >
                <option value="">
                  {getProjectSelectMessage()}
                </option>
                {getFilteredProjects().map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectName || project.title || project.name || `Proyecto ${project.projectId || project._id}`}
                  </option>
                ))}
              </select>
              
              {/* Mensajes informativos dinámicos */}
              {!idLevel && (
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Selecciona un nivel para ver proyectos
                </p>
              )}
              
              {idLevel && !idSection && (
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Selecciona una sección para ver proyectos
                </p>
              )}
              
              {idLevel && idSection && requiresSpecialty() && !idSpecialty && (
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Selecciona una especialidad para ver proyectos
                </p>
              )}
              
              {idLevel && idSection && (!requiresSpecialty() || (requiresSpecialty() && idSpecialty)) && getFilteredProjects().length === 0 && !loadingData && (
                <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  No hay proyectos disponibles para esta combinación
                </p>
              )}
              
              {idLevel && idSection && (!requiresSpecialty() || (requiresSpecialty() && idSpecialty)) && getFilteredProjects().length > 0 && (
                <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {getFilteredProjects().length} proyecto{getFilteredProjects().length !== 1 ? 's' : ''} disponible{getFilteredProjects().length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loadingData && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-700 text-sm font-medium">
                Cargando datos de catálogos...
              </p>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loadingData || codeValidation.isValid === false}
            className={`cursor-pointer flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${loadingData || codeValidation.isValid === false
              ? 'bg-gray-400 cursor-not-allowed'
              : id
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
              }`}
          >
            {id ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <span>{id ? 'Actualizar Estudiante' : 'Registrar Estudiante'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-6 bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Campos obligatorios</p>
            <p>
              Todos los campos marcados con (*) son obligatorios
              {id && ', el código debe ser único en el sistema'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
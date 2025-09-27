import React, { useState, useEffect } from 'react';

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

  // Función para determinar si un nivel es de bachillerato
  const isBachillerato = (levelName) => {
    if (!levelName) return false;
    const levelLower = levelName.toLowerCase();
    return levelLower.includes('1°') || levelLower.includes('2°') || levelLower.includes('3°') ||
           levelLower.includes('primer') || levelLower.includes('segundo') || levelLower.includes('tercer') ||
           levelLower.includes('bachillerato') || levelLower.includes('1') || levelLower.includes('2') || levelLower.includes('3');
  };

  // Función para determinar si un nivel es de básica (7°, 8°, 9°)
  const isBasica = (levelName) => {
    if (!levelName) return false;
    const levelLower = levelName.toLowerCase();
    return levelLower.includes('7°') || levelLower.includes('8°') || levelLower.includes('9°') ||
           levelLower.includes('séptimo') || levelLower.includes('octavo') || levelLower.includes('noveno') ||
           levelLower.includes('7') || levelLower.includes('8') || levelLower.includes('9');
  };

  // Función para filtrar secciones según el nivel seleccionado
  const getFilteredSections = () => {
    if (!idLevel) return sections;
    
    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) return sections;
    
    const levelName = selectedLevel.name || selectedLevel.levelName || '';
    
    if (isBachillerato(levelName)) {
      // Para bachillerato: solo secciones que contengan números (1A, 2A, 1B, 2B, 3A, 3B, etc.)
      return sections.filter(section => {
        const sectionName = (section.name || section.sectionName || '').toLowerCase();
        // Buscar patrones como "1a", "2b", "3a", etc.
        return /[123][ab]/.test(sectionName) || 
               sectionName.includes('1a') || sectionName.includes('1b') ||
               sectionName.includes('2a') || sectionName.includes('2b') ||
               sectionName.includes('3a') || sectionName.includes('3b');
      });
    } else if (isBasica(levelName)) {
      // Para básica: solo secciones que sean letras simples (A, B, C, D, E, F)
      return sections.filter(section => {
        const sectionName = (section.name || section.sectionName || '').toLowerCase().trim();
        // Solo letras simples A-F, no combinaciones con números
        return /^[abcdef]$/.test(sectionName) && 
               !sectionName.includes('1') && 
               !sectionName.includes('2') && 
               !sectionName.includes('3');
      });
    }
    
    // Para otros niveles, mostrar todas las secciones
    return sections;
  };

  // Verificar si el nivel seleccionado requiere especialidad
  const requiresSpecialty = () => {
    if (!idLevel) return false;
    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) return false;
    
    const levelName = selectedLevel.name || selectedLevel.levelName || '';
    return isBachillerato(levelName);
  };

  // Limpiar sección y especialidad cuando cambie el nivel
  useEffect(() => {
    if (idLevel) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        const levelName = selectedLevel.name || selectedLevel.levelName || '';
        
        // Si cambia de bachillerato a básica o viceversa, limpiar sección
        const currentSectionValid = getFilteredSections().some(section => section._id === idSection);
        if (!currentSectionValid) {
          setIdSection("");
        }
        
        // Si no es bachillerato, limpiar especialidad
        if (!isBachillerato(levelName)) {
          setIdSpecialty("");
        }
      }
    }
  }, [idLevel, levels, sections]);

  // Función para verificar si el código de estudiante ya existe
  const checkStudentCodeUnique = async (code) => {
    if (!code || code.trim() === '') {
      setCodeValidation({ isValid: null, message: '' });
      return;
    }

    setIsCheckingCode(true);
    
    try {
      const response = await fetch(`http://localhost:4000/api/students`);
      if (response.ok) {
        const allStudents = await response.json();
        
        // Si estamos editando, excluir el estudiante actual de la validación
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

  // Efecto para verificar el código cuando cambie
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (studentCode) {
        checkStudentCodeUnique(studentCode);
      }
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [studentCode, id]);

  // Cargar datos de catálogos
  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoadingData(true);
      setErrors({});
      
      try {
        // Cargar todos los catálogos en paralelo
        const [levelsResponse, sectionsResponse, specialtiesResponse, projectsResponse] = await Promise.all([
          fetch('http://localhost:4000/api/levels'),
          fetch('http://localhost:4000/api/sections'),
          fetch('http://localhost:4000/api/specialties'),
          fetch('http://localhost:4000/api/projects')
        ]);

        // Procesar respuesta de niveles
        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          console.log('Niveles cargados:', levelsData);
          setLevels(Array.isArray(levelsData) ? levelsData : []);
        } else {
          console.error('Error al cargar niveles:', levelsResponse.status);
          setErrors(prev => ({ ...prev, levels: 'Error al cargar niveles' }));
        }

        // Procesar respuesta de secciones
        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          console.log('Secciones cargadas:', sectionsData);
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        } else {
          console.error('Error al cargar secciones:', sectionsResponse.status);
          setErrors(prev => ({ ...prev, sections: 'Error al cargar secciones' }));
        }

        // Procesar respuesta de especialidades
        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json();
          console.log('Especialidades cargadas:', specialtiesData);
          setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        } else {
          console.error('Error al cargar especialidades:', specialtiesResponse.status);
          setErrors(prev => ({ ...prev, specialties: 'Error al cargar especialidades' }));
        }

        // Procesar respuesta de proyectos
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log('Proyectos cargados:', projectsData);
          setProjects(Array.isArray(projectsData) ? projectsData : []);
        } else {
          console.error('Error al cargar proyectos:', projectsResponse.status);
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
    
    // Validar que el código sea único antes de enviar
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
    <div className="max-w-3xl mx-auto">
      {/* Header del formulario */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-lg">
            <span className="text-3xl">{id ? '✏️' : '🎓'}</span>
          </div>
          <h2 className="text-3xl font-black text-green-800">
            {id ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
        </div>
        <div className="h-1 bg-gradient-to-r from-green-600 via-green-400 to-green-600 rounded-full max-w-xs mx-auto shadow-sm"></div>
      </div>

      {/* Mostrar errores de conexión */}
      {errors.general && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {errors.general}
        </div>
      )}

      <form className="bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-green-100" onSubmit={handleSubmit}>
        {/* Header decorativo del formulario */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-6">
          <h3 className="text-white text-xl font-bold text-center">
            Información del Estudiante
          </h3>
        </div>

        <div className="p-8 space-y-6 bg-gradient-to-b from-white to-green-50">
          {/* Código de estudiante */}
          <div className="group">
            <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
              <span className="bg-green-600 text-white p-1 rounded-full text-sm">🏷️</span>
              <span>Código de Estudiante</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="studentCode"
                value={studentCode || ''}
                onChange={(e) => setStudentCode(e.target.value)}
                className={`w-full px-4 py-4 border-3 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:ring-4 transition-all duration-300 text-lg ${
                  codeValidation.isValid === false
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
                    : codeValidation.isValid === true
                    ? 'border-green-500 focus:border-green-600 focus:ring-green-100'
                    : 'border-green-200 focus:border-green-500 focus:ring-green-100'
                }`}
                placeholder="Ej: 202301001"
                required
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {isCheckingCode ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                ) : codeValidation.isValid === true ? (
                  <span className="text-green-500 text-xl">✅</span>
                ) : codeValidation.isValid === false ? (
                  <span className="text-red-500 text-xl">❌</span>
                ) : (
                  <span className="text-green-400 text-xl">🔢</span>
                )}
              </div>
            </div>
            {/* Mensaje de validación del código */}
            {codeValidation.message && (
              <div className={`mt-2 p-2 rounded text-sm font-medium ${
                codeValidation.isValid === false
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : codeValidation.isValid === true
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              }`}>
                {codeValidation.message}
              </div>
            )}
          </div>

          {/* Nombres y Apellidos en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Nombre */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className="bg-green-600 text-white p-1 rounded-full text-sm">👤</span>
                <span>Nombre</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-green-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
                  placeholder="Ej: Juan"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-green-400 text-xl">📝</span>
                </div>
              </div>
            </div>

            {/* Campo Apellido */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className="bg-green-600 text-white p-1 rounded-full text-sm">👤</span>
                <span>Apellido</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={lastName || ''}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-green-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
                  placeholder="Ej: Pérez"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-green-400 text-xl">📝</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nivel y Sección en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Nivel */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className="bg-green-600 text-white p-1 rounded-full text-sm">📚</span>
                <span>Nivel Académico</span>
              </label>
              <div className="relative">
                <select
                  name="idLevel"
                  value={idLevel || ''}
                  onChange={(e) => setIdLevel(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-green-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
                  required
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? 'Cargando niveles...' : 'Seleccionar nivel...'}
                  </option>
                  {levels.map((level) => (
                    <option key={level._id} value={level._id}>
                      {level.name || level.levelName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-green-400 text-xl">📖</span>
                </div>
              </div>
              {errors.levels && (
                <p className="text-red-600 text-sm mt-1">{errors.levels}</p>
              )}
              {!loadingData && levels.length === 0 && !errors.levels && (
                <p className="text-yellow-600 text-sm mt-1">No hay niveles disponibles</p>
              )}
            </div>

            {/* Campo Sección */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className="bg-green-600 text-white p-1 rounded-full text-sm">📁</span>
                <span>Sección</span>
              </label>
              <div className="relative">
                <select
                  name="idSection"
                  value={idSection || ''}
                  onChange={(e) => setIdSection(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-green-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
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
                      {section.name || section.sectionName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-green-400 text-xl">📋</span>
                </div>
              </div>
              {errors.sections && (
                <p className="text-red-600 text-sm mt-1">{errors.sections}</p>
              )}
              {!loadingData && getFilteredSections().length === 0 && idLevel && !errors.sections && (
                <p className="text-yellow-600 text-sm mt-1">No hay secciones disponibles para este nivel</p>
              )}
              {idLevel && (
                <p className="text-blue-600 text-xs mt-1">
                  {(() => {
                    const selectedLevel = levels.find(level => level._id === idLevel);
                    const levelName = selectedLevel?.name || selectedLevel?.levelName || '';
                    if (isBachillerato(levelName)) {
                      return '💡 Bachillerato: Solo secciones 1A, 1B, 2A, 2B, 3A, 3B disponibles';
                    } else if (isBasica(levelName)) {
                      return '💡 Básica: Solo secciones A, B, C, D, E, F disponibles';
                    }
                    return '';
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Especialidad y Proyecto (Opcionales) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Especialidad */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className={`p-1 rounded-full text-sm ${requiresSpecialty() ? 'bg-purple-600 text-white' : 'bg-gray-400 text-gray-200'}`}>🏆</span>
                <span>Especialidad</span>
              </label>
              <div className="relative">
                <select
                  name="idSpecialty"
                  value={idSpecialty || ''}
                  onChange={(e) => setIdSpecialty(e.target.value)}
                  className={`w-full px-4 py-4 border-3 rounded-xl text-gray-800 font-medium shadow-inner transition-all duration-300 text-lg ${
                    requiresSpecialty()
                      ? 'bg-white border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
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
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className={`text-xl ${requiresSpecialty() ? 'text-purple-400' : 'text-gray-400'}`}>🎯</span>
                </div>
              </div>
              {errors.specialties && requiresSpecialty() && (
                <p className="text-red-600 text-sm mt-1">{errors.specialties}</p>
              )}
              {!requiresSpecialty() && idLevel && (
                <p className="text-gray-500 text-sm mt-1">
                  💡 La especialidad solo está disponible para estudiantes de bachillerato (1°, 2°, 3°)
                </p>
              )}
              {requiresSpecialty() && !loadingData && specialties.length === 0 && !errors.specialties && (
                <p className="text-yellow-600 text-sm mt-1">No hay especialidades disponibles</p>
              )}
            </div>

            {/* Campo Proyecto */}
            <div className="group">
              <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
                <span className="bg-blue-600 text-white p-1 rounded-full text-sm">🚀</span>
                <span>Proyecto (Opcional)</span>
              </label>
              <div className="relative">
                <select
                  name="projectId"
                  value={projectId || ''}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                  disabled={loadingData}
                >
                  <option value="">
                    {loadingData ? 'Cargando proyectos...' : 'Sin proyecto asignado...'}
                  </option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.projectName || project.title || project.name || `Proyecto ${project.projectId || project._id}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-blue-400 text-xl">📚</span>
                </div>
              </div>
              {errors.projects && (
                <p className="text-red-600 text-sm mt-1">{errors.projects}</p>
              )}
            </div>
          </div>

          {/* Mensaje de carga */}
          {loadingData && (
            <div className="bg-blue-100 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-700 text-sm font-medium">
                  Cargando datos de catálogos...
                </p>
              </div>
            </div>
          )}

         
          {/* Botones de acción */}
          <div className="pt-6 space-y-4">
            {!id ? (
              <button
                type="submit"
                disabled={loadingData || codeValidation.isValid === false}
                className={`w-full py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 flex items-center justify-center space-x-3 ${
                  loadingData || codeValidation.isValid === false
                    ? 'bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white border-green-500'
                }`}
              >
                <span className="text-2xl">💾</span>
                <span>
                  {codeValidation.isValid === false ? 'Código duplicado' : 'Registrar Estudiante'}
                </span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loadingData || codeValidation.isValid === false}
                className={`w-full py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 flex items-center justify-center space-x-3 ${
                  loadingData || codeValidation.isValid === false
                    ? 'bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 hover:from-emerald-600 hover:via-green-500 hover:to-green-600 text-white border-emerald-400'
                }`}
              >
                <span className="text-2xl">✏️</span>
                <span>
                  {codeValidation.isValid === false ? 'Código duplicado' : 'Actualizar Estudiante'}
                </span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-400 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">↩️</span>
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer decorativo del formulario */}
        <div className="h-3 bg-gradient-to-r from-green-600 via-green-400 to-green-600"></div>
      </form>

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-xl border-2 border-green-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-green-800 font-bold text-lg mb-2">Información importante:</h4>
            <ul className="text-green-700 space-y-1 text-sm font-medium">
              <li>• <strong>Código:</strong> Debe ser único para cada estudiante</li>
              <li>• <strong>Nivel y Sección:</strong> Son campos obligatorios</li>
              <li>• <strong>Secciones:</strong> Bachillerato = 1A,1B,2A,2B,3A,3B | Básica = A,B,C,D,E,F</li>
              <li>• <strong>Especialidad:</strong> Solo obligatoria para estudiantes de bachillerato</li>
              <li>• <strong>Proyecto:</strong> Se puede asignar posteriormente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota sobre campos obligatorios */}
      <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
        <p className="text-green-700 text-sm font-medium">
          <span className="font-bold">*</span> Los campos marcados son obligatorios
        </p>
      </div>
    </div>
  );
};

export default RegisterStudent;
import React, { useState, useEffect } from 'react';

const RegisterProject = ({
  projectId, setProjectId,
  projectName, setProjectName,
  googleSitesLink, setGoogleSitesLink,
  idLevel, setIdLevel,
  idSection, setIdSection,
  status, setStatus,
  teamNumber, setTeamNumber,
  assignedStudents, setAssignedStudents,
  selectedSpecialty, setSelectedSpecialty,
  saveProject,
  id,
  handleEdit,
  onCancel,
  projects
}) => {
  
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoTeamNumber, setAutoTeamNumber] = useState(1);

  const calculateNextTeamNumber = () => {
    if (!idLevel || !projects) {
      return 1;
    }

    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) {
      return 1;
    }

    const levelName = selectedLevel.levelName || selectedLevel.name || '';
    let existingProjects = [];

    if (isBasica(levelName) && idSection) {
      existingProjects = projects.filter(project => {
        const projectLevel = project.idLevel?._id || project.idLevel;
        const projectSection = project.idSection?._id || project.idSection;
        
        if (id && project._id === id) {
          return false;
        }
        
        return projectLevel === idLevel && projectSection === idSection;
      });
    }
    else if (isBachillerato(levelName) && selectedSpecialty) {
      existingProjects = projects.filter(project => {
        const projectLevel = project.idLevel?._id || project.idLevel;
        const projectSpecialty = project.selectedSpecialty?._id || project.selectedSpecialty;
        
        if (id && project._id === id) {
          return false;
        }
        
        return projectLevel === idLevel && projectSpecialty === selectedSpecialty;
      });
    }

    const existingTeamNumbers = existingProjects
      .map(project => project.teamNumber || 0)
      .filter(num => num > 0)
      .sort((a, b) => a - b);

    let nextNumber = 1;
    for (const num of existingTeamNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return nextNumber;
  };

  const generateProjectId = () => {
    if (!idLevel || !autoTeamNumber) {
      return '';
    }
    
    const selectedLevel = levels.find(level => level._id === idLevel);
    if (!selectedLevel) {
      return '';
    }
    
    const levelName = selectedLevel.levelName || selectedLevel.name || '';
    const currentYear = new Date().getFullYear().toString().slice(-2);
    let code = '';
    
    if (isBasica(levelName)) {
      if (!idSection) {
        return '';
      }
      
      const selectedSection = sections.find(section => section._id === idSection);
      if (!selectedSection) {
        return '';
      }
      
      const sectionName = selectedSection.sectionName || selectedSection.name || '';
      const levelLetter = selectedLevel.letterLevel || 'A';
      const sectionLetter = sectionName.toUpperCase().charAt(0);
      const teamNumberFormatted = autoTeamNumber.toString().padStart(2, '0');
      
      code = `${levelLetter}${sectionLetter}${teamNumberFormatted}-${currentYear}`;
    }
    else if (isBachillerato(levelName)) {
      if (!selectedSpecialty) {
        return '';
      }
      
      const specialty = specialties.find(spec => spec._id === selectedSpecialty);
      if (!specialty) {
        return '';
      }
      
      const specialtyLetter = specialty.letterSpecialty || 'A';
      const levelLetter = selectedLevel.letterLevel || '1';
      const teamNumberFormatted = autoTeamNumber.toString().padStart(2, '0');
      
      code = `${specialtyLetter}${levelLetter}${teamNumberFormatted}-${currentYear}`;
    }
    
    return code;
  };

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

  useEffect(() => {
    if (idLevel && projects && levels.length > 0) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        const levelName = selectedLevel.levelName || selectedLevel.name || '';
        
        if (isBasica(levelName) && idSection) {
          const nextTeam = calculateNextTeamNumber();
          setAutoTeamNumber(nextTeam);
          setTeamNumber(nextTeam);
        }
        else if (isBachillerato(levelName) && selectedSpecialty) {
          const nextTeam = calculateNextTeamNumber();
          setAutoTeamNumber(nextTeam);
          setTeamNumber(nextTeam);
        }
        else {
          setAutoTeamNumber(1);
          setTeamNumber(1);
        }
      }
    } else {
      setAutoTeamNumber(1);
      setTeamNumber(1);
    }
  }, [idLevel, idSection, selectedSpecialty, projects, levels, id]);

  useEffect(() => {
    if (idLevel && autoTeamNumber) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        const levelName = selectedLevel.levelName || selectedLevel.name || '';
        
        if (isBasica(levelName) && idSection) {
          const autoId = generateProjectId();
          if (autoId) {
            setProjectId(autoId);
            const googleSitesUrl = `https://sites.google.com/ricaldone.edu.sv/${autoId}`;
            setGoogleSitesLink(googleSitesUrl);
          }
        } 
        else if (isBachillerato(levelName) && selectedSpecialty) {
          const autoId = generateProjectId();
          if (autoId) {
            setProjectId(autoId);
            const googleSitesUrl = `https://sites.google.com/ricaldone.edu.sv/${autoId}`;
            setGoogleSitesLink(googleSitesUrl);
          }
        }
        else {
          setProjectId('');
          setGoogleSitesLink('');
        }
      }
    } else {
      setProjectId('');
      setGoogleSitesLink('');
    }
  }, [idLevel, idSection, selectedSpecialty, autoTeamNumber, levels, sections, specialties]);

  useEffect(() => {
    if (idLevel) {
      const selectedLevel = levels.find(level => level._id === idLevel);
      if (selectedLevel) {
        const levelName = selectedLevel.levelName || selectedLevel.name || '';
        
        if (isBasica(levelName)) {
          setSelectedSpecialty('');
          const currentSectionValid = getFilteredSections().some(section => section._id === idSection);
          if (!currentSectionValid) {
            setIdSection("");
          }
        } else if (isBachillerato(levelName)) {
          setIdSection('');
        }
      }
    }
  }, [idLevel, levels, sections]);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoadingData(true);
      setErrors({});
      
      try {
        const [levelsResponse, sectionsResponse, specialtiesResponse, studentsResponse] = await Promise.all([
          fetch('http://localhost:4000/api/levels'),
          fetch('http://localhost:4000/api/sections'),
          fetch('http://localhost:4000/api/specialties'),
          fetch('http://localhost:4000/api/students')
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

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
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
    
    if (!projectName || !idLevel || !autoTeamNumber) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const selectedLevel = levels.find(level => level._id === idLevel);
    const levelName = selectedLevel?.levelName || selectedLevel?.name || '';

    if (isBasica(levelName) && !idSection) {
      alert('Por favor selecciona una sección para Tercer Ciclo');
      return;
    }

    if (isBachillerato(levelName) && !selectedSpecialty) {
      alert('Por favor selecciona una especialidad para Bachillerato');
      return;
    }

    if (!projectId) {
      alert('Error: El ID no se ha generado. Verifica que todos los campos estén completados.');
      return;
    }

    setTeamNumber(autoTeamNumber);
    
    if (id) {
      handleEdit(e);
    } else {
      saveProject(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header del formulario */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg">
            <span className="text-3xl">{id ? '✏️' : '🔬'}</span>
          </div>
          <h2 className="text-3xl font-black text-blue-800">
            {id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full max-w-xs mx-auto shadow-sm"></div>
      </div>

      {/* Mostrar errores de conexión */}
      {errors.general && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {errors.general}
        </div>
      )}

      <form className="bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-blue-100" onSubmit={handleSubmit}>
        {/* Header decorativo del formulario */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6">
          <h3 className="text-white text-xl font-bold text-center">
            Información del Proyecto
          </h3>
        </div>

        <div className="p-8 space-y-6 bg-gradient-to-b from-white to-blue-50">
          {/* Nombre del proyecto */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-blue-600 text-white p-1 rounded-full text-sm">📋</span>
              <span>Nombre del Proyecto</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="projectName"
                value={projectName || ''}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                placeholder="Ej: Sistema de Riego Automatizado"
                required
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-blue-400 text-xl">🔬</span>
              </div>
            </div>
          </div>

          {/* Nivel y Especialidad/Sección en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Nivel */}
            <div className="group">
              <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
                <span className="bg-blue-600 text-white p-1 rounded-full text-sm">📚</span>
                <span>Nivel Académico</span>
              </label>
              <div className="relative">
                <select
                  name="idLevel"
                  value={idLevel || ''}
                  onChange={(e) => setIdLevel(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
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
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-blue-400 text-xl">📖</span>
                </div>
              </div>
              {errors.levels && (
                <p className="text-red-600 text-sm mt-1">{errors.levels}</p>
              )}
            </div>

            {/* Campo condicional: Especialidad (Bachillerato) o Sección (Básica) */}
            <div className="group">
              {(() => {
                if (!idLevel) {
                  return (
                    <>
                      <label className="flex items-center space-x-2 text-gray-600 font-bold text-lg mb-3">
                        <span className="bg-gray-400 text-white p-1 rounded-full text-sm">❓</span>
                        <span>Especialidad/Sección</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value="Primero selecciona un nivel..."
                          className="w-full px-4 py-4 border-3 border-gray-200 rounded-xl text-gray-500 font-medium shadow-inner bg-gray-50 text-lg"
                          readOnly
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xl">⏳</span>
                        </div>
                      </div>
                    </>
                  );
                }

                const selectedLevel = levels.find(level => level._id === idLevel);
                const levelName = selectedLevel?.levelName || selectedLevel?.name || '';

                if (isBachillerato(levelName)) {
                  return (
                    <>
                      <label className="flex items-center space-x-2 text-purple-800 font-bold text-lg mb-3">
                        <span className="bg-purple-600 text-white p-1 rounded-full text-sm">🎯</span>
                        <span>Especialidad</span>
                      </label>
                      <div className="relative">
                        <select
                          name="selectedSpecialty"
                          value={selectedSpecialty || ''}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full px-4 py-4 border-3 border-purple-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg"
                          required
                          disabled={loadingData}
                        >
                          <option value="">
                            {loadingData ? 'Cargando especialidades...' : 'Seleccionar especialidad...'}
                          </option>
                          {specialties.map((specialty) => (
                            <option key={specialty._id} value={specialty._id}>
                              {specialty.specialtyName} ({specialty.letterSpecialty})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <span className="text-purple-400 text-xl">🎓</span>
                        </div>
                      </div>
                    </>
                  );
                }
                
                if (isBasica(levelName)) {
                  return (
                    <>
                      <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
                        <span className="bg-blue-600 text-white p-1 rounded-full text-sm">📋</span>
                        <span>Sección</span>
                      </label>
                      <div className="relative">
                        <select
                          name="idSection"
                          value={idSection || ''}
                          onChange={(e) => setIdSection(e.target.value)}
                          className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                          required
                          disabled={loadingData}
                        >
                          <option value="">
                            {loadingData ? 'Cargando secciones...' : 'Seleccionar sección...'}
                          </option>
                          {getFilteredSections().map((section) => (
                            <option key={section._id} value={section._id}>
                              {section.sectionName || section.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <span className="text-blue-400 text-xl">📋</span>
                        </div>
                      </div>
                    </>
                  );
                }

                return (
                  <>
                    <label className="flex items-center space-x-2 text-gray-600 font-bold text-lg mb-3">
                      <span className="bg-gray-400 text-white p-1 rounded-full text-sm">❓</span>
                      <span>Tipo no reconocido</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="Nivel no reconocido"
                        className="w-full px-4 py-4 border-3 border-gray-200 rounded-xl text-gray-500 font-medium shadow-inner bg-gray-50 text-lg"
                        readOnly
                      />
                    </div>
                  </>
                );
              })()}
              
              {errors.sections && (
                <p className="text-red-600 text-sm mt-1">{errors.sections}</p>
              )}
              {errors.specialties && (
                <p className="text-red-600 text-sm mt-1">{errors.specialties}</p>
              )}
            </div>
          </div>

          {/* Número de Equipo Automático - Solo Lectura */}
          <div className="group">
            <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
              <span className="bg-green-600 text-white p-1 rounded-full text-sm">👥</span>
              <span>Número de Equipo (Asignado Automáticamente)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={autoTeamNumber ? `Equipo #${autoTeamNumber}` : 'Selecciona nivel y sección/especialidad...'}
                className={`w-full px-4 py-4 border-3 rounded-xl text-gray-800 font-medium shadow-inner text-lg transition-all duration-300 ${
                  autoTeamNumber 
                    ? 'border-green-200 bg-green-50 text-green-800' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
                readOnly
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {autoTeamNumber ? (
                  <span className="text-green-500 text-xl">✅</span>
                ) : (
                  <span className="text-gray-400 text-xl">⏳</span>
                )}
              </div>
            </div>
            <p className={`text-xs mt-1 font-medium transition-colors ${
              autoTeamNumber ? 'text-green-600' : 'text-gray-500'
            }`}>
              {autoTeamNumber 
                ? `✅ Número de equipo asignado automáticamente basado en proyectos existentes` 
                : '⏳ El número se asignará automáticamente al completar los campos'}
            </p>
          </div>

          {/* ID Generado en Tiempo Real */}
          <div className="group">
            <label className="flex items-center space-x-2 text-green-800 font-bold text-lg mb-3">
              <span className="bg-green-600 text-white p-1 rounded-full text-sm">🆔</span>
              <span>ID del Proyecto (Generado Automáticamente)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={projectId || 'Selecciona nivel, sección y el número de equipo se asignará...'}
                className={`w-full px-4 py-4 border-3 rounded-xl text-gray-800 font-medium shadow-inner text-lg transition-all duration-300 ${
                  projectId 
                    ? 'border-green-200 bg-green-50 text-green-800' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
                readOnly
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {projectId ? (
                  <span className="text-green-500 text-xl">✅</span>
                ) : (
                  <span className="text-gray-400 text-xl">⏳</span>
                )}
              </div>
            </div>
            <p className={`text-xs mt-1 font-medium transition-colors ${
              projectId ? 'text-green-600' : 'text-gray-500'
            }`}>
              {projectId 
                ? '✅ ID generado automáticamente con el número de equipo asignado' 
                : '⏳ El ID se generará automáticamente al completar los campos'}
            </p>
          </div>

          {/* Google Sites Link Generado Automáticamente */}
          <div className="group">
            <label className="flex items-center space-x-2 text-purple-800 font-bold text-lg mb-3">
              <span className="bg-purple-600 text-white p-1 rounded-full text-sm">🌐</span>
              <span>Enlace de Google Sites (Generado Automáticamente)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={googleSitesLink || 'El enlace se generará automáticamente con el ID del proyecto...'}
                className={`w-full px-4 py-4 border-3 rounded-xl text-gray-800 font-medium shadow-inner text-lg transition-all duration-300 ${
                  googleSitesLink 
                    ? 'border-purple-200 bg-purple-50 text-purple-800' 
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
                readOnly
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {googleSitesLink ? (
                  <span className="text-purple-500 text-xl">✅</span>
                ) : (
                  <span className="text-gray-400 text-xl">⏳</span>
                )}
              </div>
            </div>
            <p className={`text-xs mt-1 font-medium transition-colors ${
              googleSitesLink ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {googleSitesLink 
                ? '✅ Enlace generado automáticamente siguiendo el formato: https://sites.google.com/ricaldone.edu.sv/[ID]' 
                : '⏳ El enlace se generará automáticamente al completar los campos'}
            </p>
          </div>

          {/* Asignar estudiantes (opcional) */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-orange-600 text-white p-1 rounded-full text-sm">👥</span>
              <span>Estudiantes Asignados (Opcional)</span>
            </label>
            <div className="relative">
              <select
                multiple
                name="assignedStudents"
                value={assignedStudents || []}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                  setAssignedStudents(selectedValues);
                }}
                className="w-full px-4 py-4 border-3 border-orange-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg min-h-32"
                disabled={!idLevel || (!idSection && !selectedSpecialty)}
              >
                {(() => {
                  if (!idLevel) {
                    return (
                      <option disabled>
                        Primero selecciona un nivel académico
                      </option>
                    );
                  }

                  const selectedLevel = levels.find(level => level._id === idLevel);
                  if (!selectedLevel) {
                    return (
                      <option disabled>
                        Nivel no encontrado
                      </option>
                    );
                  }

                  const levelName = selectedLevel.levelName || selectedLevel.name || '';
                  
                  if (isBasica(levelName)) {
                    if (!idSection) {
                      return (
                        <option disabled>
                          Selecciona una sección para ver los estudiantes
                        </option>
                      );
                    }

                    const filteredStudents = (students || []).filter(student => {
                      if (!student || !student.idLevel || !student.idSection) {
                        return false;
                      }
                      const studentLevel = student.idLevel._id || student.idLevel;
                      const studentSection = student.idSection._id || student.idSection;
                      return studentLevel === idLevel && studentSection === idSection;
                    });

                    if (filteredStudents.length === 0) {
                      return (
                        <option disabled>
                          No hay estudiantes registrados en este nivel y sección
                        </option>
                      );
                    }

                    return filteredStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} {student.lastName} - {student.studentCode}
                      </option>
                    ));
                  }
                  
                  else if (isBachillerato(levelName)) {
                    if (!selectedSpecialty) {
                      return (
                        <option disabled>
                          Selecciona una especialidad para ver los estudiantes
                        </option>
                      );
                    }

                    // Para bachillerato: filtrar por nivel Y especialidad (los estudiantes tienen idSpecialty)
                    const filteredStudents = (students || []).filter(student => {
                      if (!student || !student.idLevel || !student.idSpecialty) {
                        return false;
                      }
                      const studentLevel = student.idLevel._id || student.idLevel;
                      const studentSpecialty = student.idSpecialty._id || student.idSpecialty;
                      return studentLevel === idLevel && studentSpecialty === selectedSpecialty;
                    });

                    if (filteredStudents.length === 0) {
                      return (
                        <option disabled>
                          No hay estudiantes registrados en este nivel y especialidad
                        </option>
                      );
                    }

                    return filteredStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} {student.lastName} - {student.studentCode}
                      </option>
                    ));
                  }

                  return (
                    <option disabled>
                      Tipo de nivel no reconocido
                    </option>
                  );
                })()}
              </select>
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="text-orange-400 text-xl">👨‍🎓</span>
              </div>
            </div>
            <p className="text-orange-600 text-xs mt-1">
              💡 Opcional: Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples estudiantes
            </p>
            {assignedStudents && assignedStudents.length > 0 && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-700 font-medium text-sm">
                  {assignedStudents.length} estudiante(s) seleccionado(s)
                </p>
              </div>
            )}
          </div>

          {/* Estado del proyecto */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-green-600 text-white p-1 rounded-full text-sm">⚡</span>
              <span>Estado del Proyecto</span>
            </label>
            <div className="relative">
              <select
                name="status"
                value={status || 'Activo'}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-4 border-3 border-green-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
                required
              >
                <option value="Activo">✅ Activo</option>
                <option value="Inactivo">❌ Inactivo</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-green-400 text-xl">🎯</span>
              </div>
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
                disabled={loadingData}
                className={`w-full py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 flex items-center justify-center space-x-3 ${
                  loadingData
                    ? 'bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white border-blue-500'
                }`}
              >
                <span className="text-2xl">💾</span>
                <span>Registrar Proyecto</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loadingData}
                className={`w-full py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 flex items-center justify-center space-x-3 ${
                  loadingData
                    ? 'bg-gray-400 border-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-500 hover:from-emerald-600 hover:via-blue-500 hover:to-blue-600 text-white border-emerald-400'
                }`}
              >
                <span className="text-2xl">✏️</span>
                <span>Actualizar Proyecto</span>
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
        <div className="h-3 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
      </form>

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-blue-800 font-bold text-lg mb-2">Sistema automatizado completo:</h4>
            <ul className="text-blue-700 space-y-1 text-sm font-medium">
              <li>• <strong>Numeración automática:</strong> El sistema asigna automáticamente el siguiente número de equipo disponible</li>
              <li>• <strong>Por nivel y sección:</strong> Cada combinación nivel-sección tiene su propia numeración (ej: 8°C Equipo 1, 2, 3...)</li>
              <li>• <strong>ID automático:</strong> Se genera usando [Nivel][Sección][Equipo]-[Año]</li>
              <li>• <strong>Google Sites automático:</strong> Se genera el enlace siguiendo el formato https://sites.google.com/ricaldone.edu.sv/[ID]</li>
              <li>• <strong>Filtrado inteligente:</strong> Los estudiantes se filtran automáticamente por nivel y sección/especialidad</li>
              <li>• <strong>Sin duplicados:</strong> El sistema previene números de equipo duplicados automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProject;
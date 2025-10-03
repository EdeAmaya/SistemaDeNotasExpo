import React, { useState, useEffect } from 'react';
import { Lightbulb, Hash, FileText, BookOpen, Users, Award, CheckCircle, XCircle, Edit2, Plus, Info, Loader2, Globe } from 'lucide-react';

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
          fetch('http://localhost:4000/api/levels', { credentials: 'include' }),
          fetch('http://localhost:4000/api/sections', { credentials: 'include' }),
          fetch('http://localhost:4000/api/specialties', { credentials: 'include' }),
          fetch('http://localhost:4000/api/students', { credentials: 'include' })
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
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ${id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'} flex items-center justify-center shadow-lg`}>
            {id ? <Edit2 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {id ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
            </h2>
            <p className="text-sm text-gray-500">
              {id ? 'Actualiza la información del proyecto' : 'Completa los datos para registrar un nuevo proyecto'}
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
        
        {/* Información del Proyecto */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            <span>Información del Proyecto</span>
          </h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Nombre del Proyecto *</span>
            </label>
            <input
              type="text"
              value={projectName || ''}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
              placeholder="Ej: Sistema de Riego Automatizado"
              required
            />
          </div>
        </div>

        {/* Información Académica */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>Asignación Académica</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nivel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Nivel *</span>
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

            {/* Sección o Especialidad */}
            <div>
              {(() => {
                if (!idLevel) {
                  return (
                    <>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Especialidad/Sección *
                      </label>
                      <input
                        type="text"
                        value="Primero selecciona un nivel..."
                        className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed"
                        readOnly
                      />
                    </>
                  );
                }

                const selectedLevel = levels.find(level => level._id === idLevel);
                const levelName = selectedLevel?.levelName || selectedLevel?.name || '';

                if (isBachillerato(levelName)) {
                  return (
                    <>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>Especialidad *</span>
                      </label>
                      <select
                        value={selectedSpecialty || ''}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 font-medium"
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
                    </>
                  );
                }
                
                if (isBasica(levelName)) {
                  return (
                    <>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>Sección *</span>
                      </label>
                      <select
                        value={idSection || ''}
                        onChange={(e) => setIdSection(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
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
                    </>
                  );
                }

                return (
                  <>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tipo no reconocido
                    </label>
                    <input
                      type="text"
                      value="Nivel no reconocido"
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-500 font-medium"
                      readOnly
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* IDs Automáticos */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <span>Identificación Automática</span>
          </h3>
          
          <div className="space-y-4">
            {/* Número de Equipo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Número de Equipo (Automático)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={autoTeamNumber ? `Equipo #${autoTeamNumber}` : 'Selecciona nivel y sección/especialidad...'}
                  className={`w-full px-4 py-3 border-2 rounded-lg font-bold text-lg transition-all ${
                    autoTeamNumber 
                      ? 'border-green-300 bg-green-50 text-green-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {autoTeamNumber ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${
                autoTeamNumber ? 'text-green-600' : 'text-gray-500'
              }`}>
                <Info className="w-3 h-3" />
                {autoTeamNumber 
                  ? 'Número asignado automáticamente' 
                  : 'Completa los campos para asignar número'}
              </p>
            </div>

            {/* ID del Proyecto */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>ID del Proyecto (Automático)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectId || 'El ID se generará automáticamente...'}
                  className={`w-full px-4 py-3 border-2 rounded-lg font-bold text-lg transition-all ${
                    projectId 
                      ? 'border-green-300 bg-green-50 text-green-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {projectId ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${
                projectId ? 'text-green-600' : 'text-gray-500'
              }`}>
                <Info className="w-3 h-3" />
                {projectId 
                  ? 'ID generado según nivel y equipo' 
                  : 'El ID se genera al completar los campos'}
              </p>
            </div>

            {/* Google Sites Link */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Enlace Google Sites (Automático)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={googleSitesLink || 'El enlace se generará con el ID...'}
                  className={`w-full px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    googleSitesLink 
                      ? 'border-purple-300 bg-purple-50 text-purple-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                  readOnly
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {googleSitesLink ? (
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${
                googleSitesLink ? 'text-purple-600' : 'text-gray-500'
              }`}>
                <Info className="w-3 h-3" />
                {googleSitesLink 
                  ? 'Formato: sites.google.com/ricaldone.edu.sv/[ID]' 
                  : 'El enlace se genera automáticamente'}
              </p>
            </div>
          </div>
        </div>

        {/* Estado y Estudiantes */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Configuración Adicional</span>
          </h3>
          
          <div className="space-y-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Estado del Proyecto *</span>
              </label>
              <select
                value={status || 'Activo'}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-900 font-medium"
                required
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* Estudiantes Asignados */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Estudiantes Asignados (Opcional)</span>
              </label>
              <select
                multiple
                value={assignedStudents || []}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                  setAssignedStudents(selectedValues);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium min-h-32"
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
                          No hay estudiantes en este nivel y sección
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
                          No hay estudiantes en este nivel y especialidad
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
              <p className="text-xs mt-1 text-gray-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples
              </p>
              {assignedStudents && assignedStudents.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-medium text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {assignedStudents.length} estudiante(s) seleccionado(s)
                  </p>
                </div>
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
            disabled={loadingData}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${
              loadingData
                ? 'bg-gray-400 cursor-not-allowed'
                : id
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
            }`}
          >
            {id ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{id ? 'Actualizar Proyecto' : 'Registrar Proyecto'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Sistema Automatizado</p>
            <ul className="space-y-1">
              <li>• El número de equipo se asigna automáticamente</li>
              <li>• El ID se genera con formato: [Nivel][Sección][Equipo]-[Año]</li>
              <li>• El enlace de Google Sites se crea automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProject;
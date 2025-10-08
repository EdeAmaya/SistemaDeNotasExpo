import React, { useState, useEffect } from 'react';
import { Award, Download, GraduationCap, Users, BookOpen, ArrowLeft, FileText, Trophy, Star, BarChart3 } from 'lucide-react';

const API = "https://stc-instituto-tecnico-ricaldone.onrender.com/api";

// Hook personalizado para niveles
const useLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLevels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API}/levels`, {credentials: 'include'});
        if (!response.ok) throw new Error('Error al obtener los niveles');
        const data = await response.json();
        setLevels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getLevels();
  }, []);

  return { levels, loading, error };
};

// Hook personalizado para especialidades
const useSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSpecialties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API}/specialties`, {credentials: 'include'});
        if (!response.ok) throw new Error('Error al obtener las especialidades');
        const data = await response.json();
        setSpecialties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getSpecialties();
  }, []);

  return { specialties, loading, error };
};

// Hook personalizado para secciones
const useSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSections = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/sections`, {credentials: 'include'});
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getSections();
  }, []);

  return { sections, loading };
};

// Función para parsear el projectId
const parseProjectId = (projectId) => {
  const match = projectId.match(/^([A-Z])(\d)(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  return {
    specialtyLetter: match[1],
    levelNumber: parseInt(match[2]),
    teamNumber: parseInt(match[3]),
    year: match[4]
  };
};

// Determinar si un nivel es de bachillerato
const isBachilleratoLevel = (levelName) => {
  const normalized = levelName.toLowerCase();
  return normalized.includes('bachillerato') ||
    normalized.includes('año') ||
    normalized.includes('desarrollo') ||
    normalized.includes('electr') ||
    normalized.includes('mecánica') ||
    normalized.includes('contaduría');
};

// Vista de proyectos para Tercer Ciclo (mantiene la funcionalidad original)
const TercerCicloProjectsView = ({ section, level, onBack }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/project-scores/section/${section._id}`, { credentials: 'include' });

        if (response.status === 404) {
          setProjects([]);
          return;
        }

        if (!response.ok) throw new Error('Error al cargar los proyectos');

        const data = await response.json();
        setProjects(data.data || []);
      } catch (err) {
        console.error(err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [section._id]);

  const handleDownloadDiplomas = async () => {
    if (downloading || projects.length === 0) return;

    try {
      setDownloading(true);
      const response = await fetch(`${API}/diplomas/section/${section._id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al generar los diplomas');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Diplomas_${level.levelName.replace(/\s+/g, '_')}_${section.sectionName}_Top3.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('¡Diplomas descargados exitosamente!');
    } catch (error) {
      alert('Error al descargar los diplomas. Por favor intenta nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 9) return 'bg-green-50 border-green-200';
    if (score >= 7) return 'bg-blue-50 border-blue-200';
    if (score >= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4">
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5" />
        Volver a secciones
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {level.levelName} - Sección {section.sectionName}
            </h2>
            <p className="text-gray-600">{projects.length} proyectos encontrados</p>
          </div>
        </div>
        <button
          onClick={handleDownloadDiplomas}
          disabled={downloading || projects.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg disabled:opacity-50"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Generando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Top 3
            </>
          )}
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.slice(0, 3).map((project, index) => (
            <div key={project._id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-yellow-400 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                      <div>
                        <h3 className="text-xl font-black text-gray-800">{project.projectName}</h3>
                        <span className="text-sm text-gray-500">ID: {project.projectId}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`border-2 rounded-xl p-4 text-center min-w-[140px] ${getScoreBgColor(project.scores.promedioTotal)}`}>
                    <div className="text-xs font-bold text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" />
                      TOTAL
                    </div>
                    <div className={`text-4xl font-black ${getScoreColor(project.scores.promedioTotal)}`}>
                      {project.scores.promedioTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-6 py-2 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-500'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-sm font-black text-white">
                    {index === 0 ? '1ER LUGAR' : index === 1 ? '2DO LUGAR' : '3ER LUGAR'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay proyectos</h3>
        </div>
      )}
    </div>
  );
};

// Nueva vista de proyectos para Bachillerato
const BachilleratoProjectsView = ({ level, specialty, onBack }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({ all: false, 1: false, 2: false, 3: false });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los proyectos con población de datos
        const response = await fetch(`${API}/projects`, { credentials: 'include' });
        
        if (!response.ok) throw new Error('Error al cargar los proyectos');

        const allProjects = await response.json();
        
        // Filtrar proyectos por nivel y especialidad usando el projectId
        const filteredProjects = allProjects.filter(project => {
          // Comparar IDs de nivel (pueden ser objetos o strings)
          const projectLevelId = typeof project.idLevel === 'object' ? project.idLevel._id : project.idLevel;
          const selectedLevelId = typeof level._id === 'object' ? level._id._id : level._id;
          
          if (projectLevelId !== selectedLevelId) return false;
          
          const parsed = parseProjectId(project.projectId);
          return parsed && parsed.specialtyLetter === specialty.letterSpecialty;
        });

        console.log('Proyectos filtrados:', filteredProjects);

        // Obtener todos los project scores de una vez
        const scoresResponse = await fetch(`${API}/project-scores`, { credentials: 'include' });
        let allScores = [];
        
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          allScores = scoresData.data || scoresData || [];
        }

        // Mapear proyectos con sus scores
        const projectsWithScores = filteredProjects.map(project => {
          const projectScore = allScores.find(score => {
            const scoreProjectId = typeof score.projectId === 'object' ? score.projectId._id : score.projectId;
            const currentProjectId = typeof project._id === 'object' ? project._id._id : project._id;
            return scoreProjectId === currentProjectId;
          });

          let promedioTotal = 0;
          
          if (projectScore) {
            // Calcular promedio total
            const internas = projectScore.evaluacionesInternas || [];
            const externas = projectScore.evaluacionesExternas || [];
            
            const notasInternas = internas.map(ev => ev.notaFinal || 0);
            const notasExternas = externas.map(ev => ev.notaFinal || 0);
            const totalNotas = [...notasInternas, ...notasExternas];
            
            promedioTotal = totalNotas.length > 0
              ? totalNotas.reduce((a, b) => a + b, 0) / totalNotas.length
              : 0;
          }

          return {
            ...project,
            scores: {
              promedioTotal: parseFloat(promedioTotal.toFixed(2)),
              promedioInterno: projectScore?.promedioInterno || 0,
              promedioExterno: projectScore?.promedioExterno || 0,
              totalEvaluaciones: (projectScore?.evaluacionesInternas?.length || 0) + (projectScore?.evaluacionesExternas?.length || 0)
            }
          };
        });

        // Ordenar por promedio total
        projectsWithScores.sort((a, b) => b.scores.promedioTotal - a.scores.promedioTotal);
        
        console.log('Proyectos con scores ordenados:', projectsWithScores);
        
        setProjects(projectsWithScores);
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [level._id, specialty.letterSpecialty]);

  const handleDownloadPlace = async (place) => {
    if (downloading[place] || projects.length < place) return;

    try {
      setDownloading(prev => ({ ...prev, [place]: true }));
      
      const response = await fetch(
        `${API}/diplomas/bachillerato/${level._id}/${specialty._id}/${place}`,
        { method: 'GET', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Error al generar el diploma');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const placeText = place === 1 ? '1er' : place === 2 ? '2do' : '3er';
      a.download = `Diploma_${placeText}_Lugar_${specialty.specialtyName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('¡Diploma descargado exitosamente!');
    } catch (error) {
      alert('Error al descargar el diploma. Por favor intenta nuevamente.');
    } finally {
      setDownloading(prev => ({ ...prev, [place]: false }));
    }
  };

  const handleDownloadAll = async () => {
    if (downloading.all || projects.length === 0) return;

    try {
      setDownloading(prev => ({ ...prev, all: true }));
      
      const response = await fetch(
        `${API}/diplomas/bachillerato/${level._id}/${specialty._id}`,
        { method: 'GET', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Error al generar los diplomas');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Diplomas_${level.levelName.replace(/\s+/g, '_')}_${specialty.specialtyName.replace(/\s+/g, '_')}_Top3.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('¡Diplomas descargados exitosamente!');
    } catch (error) {
      alert('Error al descargar los diplomas. Por favor intenta nuevamente.');
    } finally {
      setDownloading(prev => ({ ...prev, all: false }));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 9) return 'bg-green-50 border-green-200';
    if (score >= 7) return 'bg-blue-50 border-blue-200';
    if (score >= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4">
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5" />
        Volver a especialidades
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {level.levelName} - {specialty.specialtyName}
            </h2>
            <p className="text-gray-600">{projects.length} proyectos encontrados</p>
          </div>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={downloading.all || projects.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg disabled:opacity-50"
        >
          {downloading.all ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Generando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Descargar Top 3
            </>
          )}
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.slice(0, 3).map((project, index) => (
            <div key={project._id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                      <div>
                        <h3 className="text-xl font-black text-gray-800">{project.projectName}</h3>
                        <span className="text-sm text-gray-500">ID: {project.projectId}</span>
                      </div>
                    </div>
                    {project.assignedStudents && project.assignedStudents.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{project.assignedStudents.length} estudiantes</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className={`border-2 rounded-xl p-4 text-center min-w-[140px] ${getScoreBgColor(project.scores.promedioTotal)}`}>
                      <div className="text-xs font-bold text-gray-600 mb-1 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3" />
                        TOTAL
                      </div>
                      <div className={`text-4xl font-black ${getScoreColor(project.scores.promedioTotal)}`}>
                        {project.scores.promedioTotal.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadPlace(index + 1)}
                      disabled={downloading[index + 1]}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 shadow-lg disabled:opacity-50 transition-all"
                    >
                      {downloading[index + 1] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Descargar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className={`px-6 py-2 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-500'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-sm font-black text-white">
                    {index === 0 ? '1ER LUGAR' : index === 1 ? '2DO LUGAR' : '3ER LUGAR'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay proyectos</h3>
          <p className="text-gray-500">
            No se encontraron proyectos para esta especialidad.
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-black text-gray-800">Estadísticas</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Promedio</div>
              <div className="text-2xl font-black text-blue-600">
                {(projects.reduce((acc, p) => acc + p.scores.promedioTotal, 0) / projects.length).toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Mejor Nota</div>
              <div className="text-2xl font-black text-green-600">
                {Math.max(...projects.map(p => p.scores.promedioTotal)).toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Nota Más Baja</div>
              <div className="text-2xl font-black text-red-600">
                {Math.min(...projects.map(p => p.scores.promedioTotal)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Vista de selección de sección para Tercer Ciclo
const TercerCicloView = ({ level, sections, onBack }) => {
  const [selectedSection, setSelectedSection] = useState(null);

  const levelSections = sections.filter(section =>
    /^[A-F]$/i.test(section.sectionName)
  );

  if (selectedSection) {
    return (
      <TercerCicloProjectsView
        section={selectedSection}
        level={level}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5" />
        Volver a niveles
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-xl shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">{level.levelName}</h2>
          <p className="text-gray-600">Selecciona una sección</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {levelSections.map((section) => (
          <div
            key={section._id}
            onClick={() => setSelectedSection(section)}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-3xl font-black text-yellow-600">{section.sectionName}</span>
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-lg font-black text-gray-800">Sección {section.sectionName}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista de selección de especialidad para Bachillerato
const BachilleratoView = ({ level, specialties, onBack }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  if (selectedSpecialty) {
    return (
      <BachilleratoProjectsView
        level={level}
        specialty={selectedSpecialty}
        onBack={() => setSelectedSpecialty(null)}
      />
    );
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-6">
        <ArrowLeft className="w-5 h-5" />
        Volver a niveles
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">{level.levelName}</h2>
          <p className="text-gray-600">Selecciona una especialidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties.map((specialty) => (
          <div
            key={specialty._id}
            onClick={() => setSelectedSpecialty(specialty)}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{specialty.specialtyName}</h3>
                  <span className="text-sm font-semibold text-blue-100">
                    Código: {specialty.letterSpecialty}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Click para ver proyectos y descargar diplomas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal
const DiplomasSection = () => {
  const { levels, loading: loadingLevels, error: errorLevels } = useLevels();
  const { sections, loading: loadingSections } = useSections();
  const { specialties, loading: loadingSpecialties } = useSpecialties();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const loading = loadingLevels || loadingSections || loadingSpecialties;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (errorLevels) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <h3 className="text-sm font-bold text-red-800">Error al cargar los datos</h3>
          <p className="text-sm text-red-700 mt-1">{errorLevels}</p>
        </div>
      </div>
    );
  }

  if (selectedLevel) {
    const isBachillerato = isBachilleratoLevel(selectedLevel.levelName);
    
    if (isBachillerato) {
      return (
        <BachilleratoView
          level={selectedLevel}
          specialties={specialties}
          onBack={() => setSelectedLevel(null)}
        />
      );
    } else {
      return (
        <TercerCicloView
          level={selectedLevel}
          sections={sections}
          onBack={() => setSelectedLevel(null)}
        />
      );
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-black text-gray-800">Generación de Diplomas</h2>
        </div>
        <p className="text-gray-600">
          Selecciona el nivel académico para comenzar
        </p>
      </div>

      {levels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level._id}
              onClick={() => setSelectedLevel(level)}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-yellow-400 transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <GraduationCap className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{level.levelName}</h3>
                    {level.letterLevel && (
                      <span className="text-sm font-semibold text-yellow-100">
                        Código: {level.letterLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600">
                  {isBachilleratoLevel(level.levelName) ? 
                    `${specialties.length} especialidades disponibles` :
                    `${sections.filter(s => /^[A-F]$/i.test(s.sectionName)).length} secciones disponibles`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay niveles disponibles</h3>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Información sobre diplomas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• <strong>Tercer Ciclo:</strong> Selecciona una sección para ver proyectos y descargar diplomas</li>
              <li>• <strong>Bachillerato:</strong> Selecciona una especialidad para ver proyectos filtrados por nivel</li>
              <li>• Los proyectos se ordenan automáticamente por promedio total</li>
              <li>• Puedes descargar diplomas individuales o los 3 primeros lugares completos</li>
              <li>• Solo se generan diplomas para los 3 primeros lugares</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiplomasSection;
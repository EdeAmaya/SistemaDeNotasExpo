import React, { useState, useEffect } from 'react';
import { Award, Download, GraduationCap, Users, BookOpen, ArrowLeft, FileText, Trophy, Star, BarChart3 } from 'lucide-react';
import useLevels from '../hooks/useLevels';
import useSections from '../hooks/useSections';
import useSpecialties from '../hooks/useSpecialties';
import axios from 'axios';

const API = "https://stc-instituto-tecnico-ricaldone.onrender.com/api";

const isBachilleratoLevel = (levelName) => {
  const normalized = levelName.toLowerCase();
  return normalized.includes('bachillerato') || 
         normalized.includes('año') ||
         normalized.includes('desarrollo') ||
         normalized.includes('electr') ||
         normalized.includes('mecánica') ||
         normalized.includes('contaduría');
};

const getSectionsForLevel = (levelName, allSections) => {
  const normalizedLevel = levelName.toLowerCase();
  
  if (normalizedLevel.includes('tercer ciclo') || 
      normalizedLevel.includes('3er ciclo') ||
      normalizedLevel.includes('octavo') ||
      normalizedLevel.includes('noveno') ||
      normalizedLevel.includes('séptimo') ||
      normalizedLevel.includes('7') ||
      normalizedLevel.includes('8') ||
      normalizedLevel.includes('9')) {
    return allSections.filter(section => 
      /^[A-F]$/i.test(section.sectionName)
    );
  }
  
  if (isBachilleratoLevel(levelName)) {
    return allSections.filter(section => {
      const name = section.sectionName;
      return name === '1A' || name === '1B' || name === '2A' || name === '2B';
    });
  }
  
  return [];
};

const ProjectsListView = ({ section, level, onBack }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/project-scores/section/${section._id}`);
        setProjects(response.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los proyectos');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [section._id]);

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

  const handleDownloadDiplomas = () => {
    alert(`Generando diplomas para:\n\nNivel: ${level.levelName}\nSección: ${section.sectionName}\n\n¡La descarga comenzará en breve!`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a secciones
        </button>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a secciones
        </button>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Error al cargar proyectos</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a secciones
        </button>
        <div className="flex items-center justify-between">
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
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Descargar Diplomas
          </button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {index < 3 && (
                        <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                      )}
                      <div>
                        <h3 className="text-xl font-black text-gray-800">{project.projectName}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-semibold text-gray-600">
                            Equipo #{project.teamNumber}
                          </span>
                          <span className="text-sm text-gray-500">
                            ID: {project.projectId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {project.students && project.students.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Users className="w-4 h-4" />
                        <span>{project.students.length} estudiantes</span>
                      </div>
                    )}

                    {project.googleSitesLink && (
                      <a
                        href={project.googleSitesLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Ver proyecto →
                      </a>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <div className={`border-2 rounded-xl p-4 text-center min-w-[120px] ${getScoreBgColor(project.scores.promedioInterno)}`}>
                      <div className="text-xs font-bold text-gray-600 mb-1">Interno</div>
                      <div className={`text-3xl font-black ${getScoreColor(project.scores.promedioInterno)}`}>
                        {project.scores.promedioInterno.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {project.scores.evaluacionesInternas} eval
                      </div>
                    </div>

                    <div className={`border-2 rounded-xl p-4 text-center min-w-[120px] ${getScoreBgColor(project.scores.promedioExterno)}`}>
                      <div className="text-xs font-bold text-gray-600 mb-1">Externo</div>
                      <div className={`text-3xl font-black ${getScoreColor(project.scores.promedioExterno)}`}>
                        {project.scores.promedioExterno.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {project.scores.evaluacionesExternas} eval
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
                      <div className="text-xs text-gray-500 mt-1">
                        {project.scores.totalEvaluaciones} evaluaciones
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {index < 3 && (
                <div className={`px-6 py-2 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-500'}`}>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4 text-white" />
                    <span className="text-sm font-black text-white">
                      {index === 0 ? '1ER LUGAR' : index === 1 ? '2DO LUGAR' : '3ER LUGAR'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay proyectos</h3>
          <p className="text-gray-500">
            No se encontraron proyectos para esta sección.
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-black text-gray-800">Estadísticas de la Sección</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Promedio General</div>
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
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Evaluaciones</div>
              <div className="text-2xl font-black text-purple-600">
                {projects.reduce((acc, p) => acc + p.scores.totalEvaluaciones, 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LevelCard = ({ level, sections, specialties, onSelectLevel }) => {
  const levelSections = getSectionsForLevel(level.levelName, sections);
  const isBachillerato = isBachilleratoLevel(level.levelName);

  return (
    <div 
      onClick={() => onSelectLevel(level)}
      className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-yellow-400 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
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
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">
              <span className="font-bold text-gray-800">{levelSections.length}</span> Secciones
            </span>
          </div>
          {isBachillerato && (
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">
                <span className="font-bold text-gray-800">{specialties.length}</span> Especialidades
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TercerCicloDetail = ({ level, sections, onBack }) => {
  const levelSections = getSectionsForLevel(level.levelName, sections);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
  };

  if (selectedSection) {
    return (
      <ProjectsListView
        section={selectedSection}
        level={level}
        onBack={handleBackToSections}
      />
    );
  }

  const handleDownloadSection = (section) => {
    console.log(`Descargando diplomas para ${level.levelName} - Sección ${section.sectionName}`);
    alert(`Generando diplomas para:\n\nNivel: ${level.levelName}\nSección: ${section.sectionName}\n\n¡La descarga comenzará en breve!`);
  };

  const handleDownloadAll = () => {
    console.log(`Descargando todos los diplomas para ${level.levelName}`);
    alert(`Generando todos los diplomas para:\n\nNivel: ${level.levelName}\nSecciones: ${levelSections.map(s => s.sectionName).join(', ')}\n\n¡La descarga comenzará en breve!`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a niveles
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">{level.levelName}</h2>
              <p className="text-gray-600">Selecciona una sección para ver proyectos y descargar diplomas</p>
            </div>
          </div>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Descargar Todas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {levelSections.map((section) => (
          <div
            key={section._id}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-6 text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-3xl font-black text-yellow-600">{section.sectionName}</span>
              </div>
              <h3 className="text-lg font-black text-white">Sección {section.sectionName}</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleSelectSection(section)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
              >
                <FileText className="w-4 h-4" />
                Ver Proyectos
              </button>
              <button
                onClick={() => handleDownloadSection(section)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BachilleratoDetail = ({ level, sections, specialties, onBack }) => {
  const levelSections = getSectionsForLevel(level.levelName, sections);
  
  const grupo1Sections = levelSections.filter(s => s.sectionName.startsWith('1'));
  const grupo2Sections = levelSections.filter(s => s.sectionName.startsWith('2'));

  const handleDownloadSpecialtyGroup = (specialty, groupNumber, groupSections) => {
    console.log(`Descargando diplomas para ${level.levelName} - ${specialty.specialtyName} - Grupo ${groupNumber}`);
    alert(`Generando diplomas para:\n\nNivel: ${level.levelName}\nEspecialidad: ${specialty.specialtyName}\nGrupo: ${groupNumber}\nSecciones: ${groupSections.map(s => s.sectionName).join(', ')}\n\n¡La descarga comenzará en breve!`);
  };

  const handleDownloadSpecialty = (specialty) => {
    console.log(`Descargando todos los diplomas para ${level.levelName} - ${specialty.specialtyName}`);
    alert(`Generando todos los diplomas para:\n\nNivel: ${level.levelName}\nEspecialidad: ${specialty.specialtyName}\nTodos los grupos\n\n¡La descarga comenzará en breve!`);
  };

  const handleDownloadAll = () => {
    console.log(`Descargando todos los diplomas para ${level.levelName}`);
    alert(`Generando todos los diplomas para:\n\nNivel: ${level.levelName}\nTodas las especialidades\nTodos los grupos\n\n¡La descarga comenzará en breve!`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 font-semibold mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a niveles
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">{level.levelName}</h2>
              <p className="text-gray-600">Selecciona especialidad y grupo para descargar diplomas</p>
            </div>
          </div>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Descargar Todas
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {specialties.map((specialty) => (
          <div
            key={specialty._id}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{specialty.specialtyName}</h3>
                  {specialty.letterSpecialty && (
                    <span className="text-sm font-semibold text-blue-100">
                      Código: {specialty.letterSpecialty}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownloadSpecialty(specialty)}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                Descargar Especialidad
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {grupo1Sections.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                      <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-4xl font-black text-blue-600">1</span>
                      </div>
                      <h4 className="text-2xl font-black text-white mb-1">Grupo 1</h4>
                      <p className="text-blue-100 text-sm font-semibold">
                        Secciones: {grupo1Sections.map(s => s.sectionName).join(', ')}
                      </p>
                    </div>
                    <div className="p-6">
                      <button
                        onClick={() => handleDownloadSpecialtyGroup(specialty, 1, grupo1Sections)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-black text-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                      >
                        <Download className="w-6 h-6" />
                        Descargar Grupo 1
                      </button>
                    </div>
                  </div>
                )}

                {grupo2Sections.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
                      <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-4xl font-black text-green-600">2</span>
                      </div>
                      <h4 className="text-2xl font-black text-white mb-1">Grupo 2</h4>
                      <p className="text-green-100 text-sm font-semibold">
                        Secciones: {grupo2Sections.map(s => s.sectionName).join(', ')}
                      </p>
                    </div>
                    <div className="p-6">
                      <button
                        onClick={() => handleDownloadSpecialtyGroup(specialty, 2, grupo2Sections)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-black text-lg hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                      >
                        <Download className="w-6 h-6" />
                        Descargar Grupo 2
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiplomasSection = () => {
  const { levels, loading: loadingLevels, error: errorLevels } = useLevels();
  const { sections, loading: loadingSections } = useSections();
  const { specialties, loading: loadingSpecialties } = useSpecialties();
  
  const [selectedLevel, setSelectedLevel] = useState(null);

  const loading = loadingLevels || loadingSections || loadingSpecialties;

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
  };

  const handleBack = () => {
    setSelectedLevel(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando información de diplomas...</p>
        </div>
      </div>
    );
  }

  if (errorLevels) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800">Error al cargar los datos</h3>
              <p className="text-sm text-red-700 mt-1">{errorLevels}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLevel) {
    const isBachillerato = isBachilleratoLevel(selectedLevel.levelName);
    
    if (isBachillerato) {
      return (
        <BachilleratoDetail
          level={selectedLevel}
          sections={sections}
          specialties={specialties}
          onBack={handleBack}
        />
      );
    } else {
      return (
        <TercerCicloDetail
          level={selectedLevel}
          sections={sections}
          onBack={handleBack}
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
          Selecciona el nivel académico para ver las secciones y descargar los diplomas correspondientes.
        </p>
      </div>

      {levels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <LevelCard
              key={level._id}
              level={level}
              sections={sections}
              specialties={specialties}
              onSelectLevel={handleSelectLevel}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No hay niveles disponibles</h3>
          <p className="text-gray-500">
            No se encontraron niveles académicos en el sistema.
          </p>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Información sobre diplomas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• <strong>Tercer Ciclo:</strong> Haz clic en "Ver Proyectos" para ver todos los proyectos de la sección con sus calificaciones</li>
              <li>• <strong>Bachillerato:</strong> Haz clic en el nivel para ver especialidades con Grupo 1 (1A, 1B) y Grupo 2 (2A, 2B)</li>
              <li>• Puedes descargar diplomas por grupo, por especialidad completa o todas a la vez</li>
              <li>• Los proyectos se ordenan automáticamente por promedio total de mayor a menor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiplomasSection;
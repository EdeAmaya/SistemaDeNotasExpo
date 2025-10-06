import React, { useState } from 'react';
import { Lightbulb, Plus, BookOpen, CheckCircle, XCircle, Globe, Info } from 'lucide-react';
import ListProjects from './components/ListProjects';
import RegisterProject from './components/RegisterProject';
import useDataProjects from './hooks/useDataProjects';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const {
    projects,
    loading,
    id,
    projectId,
    projectName,
    googleSitesLink,
    idLevel,
    idSection,
    status,
    teamNumber,
    assignedStudents,
    selectedSpecialty,
    setProjectId,
    setProjectName,
    setGoogleSitesLink,
    setIdLevel,
    setIdSection,
    setStatus,
    setTeamNumber,
    setAssignedStudents,
    setSelectedSpecialty,
    saveProject,
    deleteProject,
    updateProject,
    handleEdit,
    clearForm
  } = useDataProjects();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      clearForm();
    }
  };

  const handleCancelEdit = () => {
    clearForm();
    setActiveTab('list');
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Activo').length,
    inactive: projects.filter(p => p.status === 'Inactivo').length,
    withLink: projects.filter(p => p.googleSitesLink).length,
  };

  React.useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [levelsRes, sectionsRes, specialtiesRes, projectsRes] = await Promise.all([
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/levels', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/sections', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/specialties', { credentials: 'include' }),
          fetch('https://stc-instituto-tecnico-ricaldone.onrender.com/api/projects', { credentials: 'include' })
        ]);

        if (levelsRes.ok) setLevels(await levelsRes.json());
        if (sectionsRes.ok) setSections(await sectionsRes.json());
        if (specialtiesRes.ok) setSpecialties(await specialtiesRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
      } catch (error) {
        console.error('Error cargando catálogos:', error);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Header Superior - Responsive */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-blue-600 font-semibold">Gestión de Proyectos</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                  Proyectos Técnicos Científicos
                </h1>
              </div>
            </div>

            {/* Stats - Responsive
            <div className="grid grid-cols-3 lg:flex lg:items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.total}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Total</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.active}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Activos</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.withLink}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Con Sitio</div>
              </div>
            </div>*/}
          </div>
        </div>
      </div>

      {/* Tabs - Responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 lg:static z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleTabChange('list')}
              className={`relative px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === 'list' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Lista de Proyectos</span>
                <span className="sm:hidden">Lista</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                  {stats.total}
                </span>
              </div>
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('register')}
              className={`relative px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === 'register' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">{id ? 'Editar Proyecto' : 'Nuevo Proyecto'}</span>
                <span className="sm:hidden">{id ? 'Editar' : 'Nuevo'}</span>
              </div>
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === 'list' ? (
            <ListProjects
              projects={projects}
              loading={loading}
              deleteProject={deleteProject}
              updateProject={(project) => {
                updateProject(project);
                setActiveTab('register');
              }}
              levels={levels}
              sections={sections}
              specialties={specialties}
            />
          ) : (
            <div className="p-4 sm:p-6 lg:p-8">
              <RegisterProject
                projectId={projectId}
                setProjectId={setProjectId}
                projectName={projectName}
                setProjectName={setProjectName}
                googleSitesLink={googleSitesLink}
                setGoogleSitesLink={setGoogleSitesLink}
                idLevel={idLevel}
                setIdLevel={setIdLevel}
                idSection={idSection}
                setIdSection={setIdSection}
                status={status}
                setStatus={setStatus}
                teamNumber={teamNumber}
                setTeamNumber={setTeamNumber}
                assignedStudents={assignedStudents}
                setAssignedStudents={setAssignedStudents}
                selectedSpecialty={selectedSpecialty}
                setSelectedSpecialty={setSelectedSpecialty}
                projects={projects}
                saveProject={saveProject}
                id={id}
                handleEdit={handleEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          )}
        </div>

        {/* Footer - Responsive */}
        <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 sm:p-5 rounded-r-xl">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Gestión de Proyectos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">ID Automático:</span> Generación inteligente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Google Sites:</span> Documentación en línea</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Estado:</span> Control activo/inactivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Asignación:</span> Por nivel y sección</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Projects;
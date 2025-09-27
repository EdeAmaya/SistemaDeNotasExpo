import React, { useState } from 'react';
import ListProjects from './components/ListProjects';
import RegisterProject from './components/RegisterProject';
import useDataProjects from './hooks/useDataProjects';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    // Estados
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
    
    // Setters
    setProjectId,
    setProjectName,
    setGoogleSitesLink,
    setIdLevel,
    setIdSection,
    setStatus,
    setTeamNumber,
    setAssignedStudents,
    setSelectedSpecialty,
    
    // Funciones
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white text-blue-700 p-4 rounded-full shadow-lg">
                <span className="text-3xl">🔬</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-wide drop-shadow-lg">
                  Proyectos Técnicos Científicos
                </h1>
                <p className="text-blue-200 text-lg font-medium mt-1">
                  Gestión de proyectos de investigación y desarrollo
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nota explicativa en el header */}
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 p-4 rounded-lg">
            <p className="text-blue-100 text-sm font-medium">
              <span className="font-bold">💡 Proyectos Científicos:</span> Gestión de investigaciones académicas, documentación en Google Sites, 
              asignación por niveles y secciones. Seguimiento del estado de desarrollo de cada proyecto.
              <span className="font-bold"> Nueva función:</span> Numeración automática de equipos por nivel y sección.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex">
            <button
              onClick={() => handleTabChange('list')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔬 Proyectos Científicos
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {id ? '✏️ Editar Proyecto' : '➕ Registrar Proyecto'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {activeTab === 'list' ? (
            <ListProjects 
              projects={projects}
              loading={loading}
              deleteProject={deleteProject}
              updateProject={(project) => {
                updateProject(project);
                setActiveTab('register');
              }}
            />
          ) : (
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
              projects={projects} // NUEVA PROP: Pasar los proyectos para la numeración automática
              saveProject={saveProject}
              id={id}
              handleEdit={handleEdit}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📋</span>
            <div>
              <h4 className="text-blue-800 font-bold text-lg mb-2">Gestión de Proyectos Científicos:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm font-medium">
                <div>
                  <h5 className="font-bold mb-1">🔬 Información del Proyecto:</h5>
                  <ul className="space-y-1">
                    <li>• ID único del proyecto</li>
                    <li>• Nombre descriptivo del proyecto</li>
                    <li>• Enlace a Google Sites (opcional)</li>
                    <li>• Nivel y sección asignados</li>
                    <li>• <strong>Numeración automática de equipos</strong></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold mb-1">🎯 Funcionalidades:</h5>
                  <ul className="space-y-1">
                    <li>• Registro y edición de proyectos</li>
                    <li>• Control de estado (Activo/Inactivo)</li>
                    <li>• Documentación en línea</li>
                    <li>• Filtros y búsqueda avanzada</li>
                    <li>• <strong>Asignación automática de números de equipo</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
import React from "react";

const ProjectCard = ({ project, deleteProject, updateProject }) => {
  
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      deleteProject(project._id);
    }
  };

  const handleEdit = () => {
    updateProject(project);
  };

  // Función para obtener el nombre del nivel
  const getLevelName = (level) => {
    if (!level) return 'No asignado';
    return level.name || level.levelName || 'Nivel no definido';
  };

  // Función para obtener el nombre de la sección
  const getSectionName = (section) => {
    if (!section) return 'No asignada';
    return section.name || section.sectionName || 'Sección no definida';
  };

  // Función para abrir el enlace de Google Sites
  const openGoogleSite = () => {
    if (project.googleSitesLink) {
      window.open(project.googleSitesLink, '_blank');
    }
  };

  return (
    <div className="group max-w-sm mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-blue-100 hover:border-blue-300 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
      {/* Header del proyecto */}
      <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 p-6">
        <div className="text-center">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl">🔬</span>
          </div>
          <h2 className="text-white font-black text-lg text-center leading-tight">
            {project.projectName}
          </h2>
          <p className="text-white/90 font-medium mt-2">ID: {project.projectId}</p>
        </div>
        
        {/* Badge de estado */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            project.status === 'Activo'
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {project.status === 'Activo' ? '✅ Activo' : '❌ Inactivo'}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-6 bg-gradient-to-b from-white to-blue-50">
        {/* Información académica */}
        <div className="space-y-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="text-blue-600 text-sm font-bold mb-1">📚 Nivel</div>
            <div className="text-blue-800 font-medium">
              {getLevelName(project.idLevel)}
            </div>
          </div>
          
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="text-green-600 text-sm font-bold mb-1">📝 Sección</div>
            <div className="text-green-800 font-medium">
              {getSectionName(project.idSection)}
            </div>
          </div>

          {project.googleSitesLink && (
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="text-purple-600 text-sm font-bold mb-1">🌐 Sitio Web</div>
              <button
                onClick={openGoogleSite}
                className="text-purple-800 font-medium hover:text-purple-600 transition-colors underline truncate max-w-full block text-left"
                title="Abrir en nueva ventana"
              >
                Ver proyecto en línea
              </button>
            </div>
          )}

          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 text-sm font-bold mb-1">📅 Creado</div>
            <div className="text-gray-800 font-medium">
              {new Date(project.createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Botón para abrir sitio web (si existe) */}
          {project.googleSitesLink && (
            <button
              onClick={openGoogleSite}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-400 flex items-center justify-center space-x-2"
            >
              <span>🌐</span>
              <span>Ver Sitio</span>
            </button>
          )}
          
          {/* Botones de editar y eliminar */}
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 flex items-center justify-center space-x-2"
            >
              <span>🗑️</span>
              <span>Eliminar</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-300 flex items-center justify-center space-x-2"
            >
              <span>✏️</span>
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Elemento decorativo inferior */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
    </div>
  );
};

export default ProjectCard;
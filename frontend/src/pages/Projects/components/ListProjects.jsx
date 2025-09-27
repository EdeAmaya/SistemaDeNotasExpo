import React, { useState } from "react";
import ProjectCard from "./ProjectCard";

const ListProjects = ({ projects, loading, deleteProject, updateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar proyectos por búsqueda
  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return project.projectName.toLowerCase().includes(searchLower) ||
           project.projectId.toLowerCase().includes(searchLower) ||
           (project.idLevel?.name && project.idLevel.name.toLowerCase().includes(searchLower)) ||
           (project.idSection?.name && project.idSection.name.toLowerCase().includes(searchLower)) ||
           project.status.toLowerCase().includes(searchLower);
  });

  const getStats = () => {
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'Activo').length,
      inactive: projects.filter(p => p.status === 'Inactivo').length,
      withLink: projects.filter(p => p.googleSitesLink).length
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg">
            <span className="text-2xl">🔬</span>
          </div>
          <h1 className="text-4xl font-black text-blue-800 tracking-wide">
            Proyectos Técnicos Científicos
          </h1>
        </div>
        
        {/* Línea decorativa */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-600 rounded-full"></div>
          <div className="h-2 w-8 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full shadow-md"></div>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300 text-center">
          <div className="text-2xl font-black text-blue-800">{stats.total}</div>
          <div className="text-blue-600 font-bold text-sm">Total Proyectos</div>
        </div>
        <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-xl border-2 border-green-300 text-center">
          <div className="text-2xl font-black text-green-800">{stats.active}</div>
          <div className="text-green-600 font-bold text-sm">Activos</div>
        </div>
        <div className="bg-gradient-to-r from-red-100 to-red-200 p-4 rounded-xl border-2 border-red-300 text-center">
          <div className="text-2xl font-black text-red-800">{stats.inactive}</div>
          <div className="text-red-600 font-bold text-sm">Inactivos</div>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl border-2 border-purple-300 text-center">
          <div className="text-2xl font-black text-purple-800">{stats.withLink}</div>
          <div className="text-purple-600 font-bold text-sm">Con Sitio Web</div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-blue-100 shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, ID, nivel, sección o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <span className="absolute left-4 top-3 text-blue-400 text-xl">🔍</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center">
            <p className="text-blue-700 font-bold text-lg">Cargando proyectos...</p>
            <p className="text-blue-500 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!projects || projects.length === 0) && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-blue-600">🔬</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-blue-800">¡No hay proyectos registrados!</h3>
            <p className="text-blue-600 max-w-md mx-auto">
              Aún no se han registrado proyectos en el sistema. 
              ¡Comienza agregando el primer proyecto!
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-gray-500">🔍</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">No se encontraron resultados</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No hay proyectos que coincidan con tu búsqueda.
            </p>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <>
          {/* Contador de resultados */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-full border-2 border-blue-300 shadow-lg">
              <span className="text-blue-700 font-bold">Mostrando:</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-sm shadow-inner">
                {filteredProjects.length}
              </span>
              <span className="text-blue-700 font-bold">
                {filteredProjects.length === 1 ? 'Proyecto' : 'Proyectos'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
            {filteredProjects.map((project, index) => (
              <div
                key={project._id}
                className="animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <ProjectCard
                  project={project}
                  deleteProject={deleteProject}
                  updateProject={updateProject}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default ListProjects;
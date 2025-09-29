import React from 'react';
import useStages from '../../hooks/useStages';
import useConnectedUsers from '../../hooks/useConnectedUsers';
import useRecentActivities from '../../hooks/useRecentActivities'; // NUEVO IMPORT

const Dashboard = () => {
  const currentUser = "Eduardo";
  
  // Hooks existentes
  const { calculateProgress, loading: stagesLoading } = useStages();
  const currentProgress = calculateProgress();
  
  // NUEVO: Hook separado para usuarios conectados y actividades
  const { connectedUsers, loading: usersLoading, formatTimeAgo } = useConnectedUsers();
  const { recentActivities, loading: activitiesLoading, formatTimeAgo: formatActivityTime } = useRecentActivities();
  
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-ES', options);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Función para obtener el icono del rol
  const getRoleIcon = (role) => {
    switch(role) {
      case 'Docente': return '👨‍🏫';
      case 'Evaluador': return '👨‍💼';
      case 'Admin': return '👑';
      default: return '👤';
    }
  };

  const actions = [
    {
      id: 1,
      title: "VER PROYECTOS",
      icon: "👁️",
      action: () => console.log("Navegar a /proyectos")
    },
    {
      id: 2,
      title: "CREAR EVALUACIÓN",
      icon: "⭐",
      action: () => console.log("Navegar a /evaluaciones")
    },
    {
      id: 3,
      title: "GENERAR REPORTE",
      icon: "🖨️",
      action: () => console.log("Generar reporte")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="px-8 py-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Welcome Section */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold text-white">
                {getCurrentGreeting()}, {currentUser}!
              </h1>
              <span className="text-3xl ml-2">☀️</span>
            </div>
            <p className="text-gray-300 text-base mb-1 capitalize">
              {getCurrentDate()}
            </p>
            <p className="text-white text-3xl font-light">
              {getCurrentTime()}
            </p>
          </div>

          {/* Settings Icon */}
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl text-gray-400">⚙️</span>
          </button>
        </div>

        {/* Current Stage Section */}
        <div className="flex justify-end mb-8">
          <div className="text-right">
            <p className="text-gray-300 text-lg mb-2">Etapa Actual:</p>
            <div className="flex items-center gap-4">
              <span className={`text-8xl font-bold ${
                currentProgress <= 20 ? 'text-red-600' :
                currentProgress <= 40 ? 'text-yellow-500' :
                currentProgress <= 60 ? 'text-orange-500' :
                currentProgress <= 80 ? 'text-blue-500' :
                'text-green-500'
              }`}>
                {stagesLoading ? (
                  <div className="animate-pulse">--</div>
                ) : (
                  `${currentProgress}%`
                )}
              </span>
              <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <span className="text-xl text-gray-300">⚙️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description and Two-Column Section */}
        <div className="flex gap-8 mb-8">
          {/* Description */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-4">Descripción</h2>
            <div className="bg-gray-800 rounded-2xl p-6">
              <p className="text-white leading-6">
                El <span className="font-bold">Proyecto Técnico Científico</span> es un proceso de aprendizaje significativo que integra las competencias adquiridas durante el año lectivo para ser aplicadas en la{" "}
                <span className="font-bold">propuesta de solución a una necesidad del entorno social, industrial, económico o cultural.</span>
              </p>
              <button className="bg-white text-black px-6 py-2 rounded-full font-semibold mt-4 hover:bg-gray-200 transition-colors">
                LEER MÁS
              </button>
            </div>
          </div>

          {/* NUEVA SECCIÓN: Dos columnas separadas */}
          <div className="w-96 space-y-6">
            
            {/* Usuarios Conectados */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Usuarios conectados</h2>
              <div className="bg-gray-800 rounded-2xl p-4">
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="h-3 bg-gray-600 rounded w-20 mb-1"></div>
                            <div className="h-2 bg-gray-700 rounded w-12"></div>
                          </div>
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : connectedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {connectedUsers.slice(0, 4).map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{getRoleIcon(user.role)}</span>
                            <p className="font-semibold text-white text-sm">
                              {user.name} {user.lastName}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">{user.role}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-400 text-sm">No hay usuarios conectados</p>
                  </div>
                )}
                
                {/* Footer usuarios conectados */}
                {!usersLoading && connectedUsers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 text-center">
                      {connectedUsers.filter(u => u.isOnline).length} usuarios en línea
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actividades Recientes */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Actividades recientes</h2>
              <div className="bg-gray-800 rounded-2xl p-4">
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-600 rounded w-full mb-1"></div>
                        <div className="h-2 bg-gray-700 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity._id} className="border-b border-gray-700 pb-2 last:border-b-0">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs">{getRoleIcon(activity.user.role)}</span>
                          <div className="flex-1">
                            <p className="text-xs text-white font-medium">
                              {activity.user.name} {activity.user.lastName}
                            </p>
                            <p className="text-xs text-blue-300">
                              {activity.actionDescription}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatActivityTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-400 text-sm">No hay actividades recientes</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Acciones</h2>
          <div className="flex gap-6 justify-center">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-gray-800 rounded-2xl p-8 flex-1 max-w-xs hover:bg-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <p className="text-white font-semibold text-sm">
                    {action.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
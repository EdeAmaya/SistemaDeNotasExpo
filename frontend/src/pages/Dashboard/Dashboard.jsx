import React from 'react';
import useStages from '../../hooks/useStages';
import useConnectedUsers from '../../hooks/useConnectedUsers';
import useRecentActivities from '../../hooks/useRecentActivities';
import usePresence from '../../hooks/usePresence';

const Dashboard = () => {
  const currentUser = "Eduardo";
  
  const { calculateProgress, loading: stagesLoading } = useStages();
  const currentProgress = calculateProgress();
  
  const { 
    connectedUsers, 
    loading: usersLoading, 
    formatTimeAgo,
    getPresenceInfo
  } = useConnectedUsers();
  
  const { recentActivities, loading: activitiesLoading, formatTimeAgo: formatActivityTime } = useRecentActivities();
  
  usePresence();
  
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
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
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Docente': return '●';
      case 'Evaluador': return '●';
      case 'Admin': return '●';
      default: return '●';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Docente': return 'text-emerald-600';
      case 'Evaluador': return 'text-blue-600';
      case 'Admin': return 'text-purple-600';
      default: return 'text-slate-600';
    }
  };

  const actions = [
    {
      id: 1,
      title: "Ver Proyectos",
      description: "Consulta todos los proyectos",
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => console.log("Navegar a /proyectos")
    },
    {
      id: 2,
      title: "Crear Evaluación",
      description: "Nueva evaluación académica",
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      action: () => console.log("Navegar a /evaluaciones")
    },
    {
      id: 3,
      title: "Generar Reporte",
      description: "Informes y estadísticas",
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => console.log("Generar reporte")
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        
        {/* Header Section - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {getCurrentGreeting()}, {currentUser}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 capitalize">
                {getCurrentDate()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-light text-slate-700">
                {getCurrentTime()}
              </div>
            </div>
          </div>
        </div>

        {/* Current Stage Section - Responsive */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                Progreso del Proyecto Técnico Científico
              </p>
              <div className="flex items-center space-x-4">
                <span className={`text-4xl sm:text-5xl font-bold ${
                  currentProgress <= 20 ? 'text-red-600' :
                  currentProgress <= 40 ? 'text-amber-600' :
                  currentProgress <= 60 ? 'text-yellow-600' :
                  currentProgress <= 80 ? 'text-blue-600' :
                  'text-emerald-600'
                }`}>
                  {stagesLoading ? '--' : `${currentProgress}%`}
                </span>
              </div>
            </div>
            
            {/* Circular Progress - Responsive */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke={
                      currentProgress <= 20 ? '#dc2626' :
                      currentProgress <= 40 ? '#d97706' :
                      currentProgress <= 60 ? '#ca8a04' :
                      currentProgress <= 80 ? '#2563eb' :
                      '#059669'
                    }
                    strokeWidth="12"
                    strokeDasharray={`${(currentProgress / 100) * 552.92} 552.92`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Description Section - Responsive */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
              Acerca del Proyecto
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              El <span className="font-semibold text-slate-800">Proyecto Técnico Científico</span> es un proceso de aprendizaje significativo que integra las competencias adquiridas durante el año lectivo para ser aplicadas en la propuesta de solución a una necesidad del entorno social, industrial, económico o cultural.
            </p>
            <button className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Leer más →
            </button>
          </div>

          {/* Usuarios Conectados - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
              Usuarios Activos
            </h2>
            
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                        <div className="h-2 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : connectedUsers.length > 0 ? (
              <div className="space-y-3">
                {connectedUsers.slice(0, 4).map((userActivity) => {
                  const presenceInfo = getPresenceInfo(userActivity.presenceStatus);
                  return (
                    <div key={userActivity._id} className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className={`text-xs sm:text-sm font-semibold ${getRoleColor(userActivity.role)}`}>
                            {userActivity.name.charAt(0)}{userActivity.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${presenceInfo.color} ${
                          userActivity.presenceStatus === 'online' ? 'animate-pulse' : ''
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                          {userActivity.name} {userActivity.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {userActivity.role} • {formatTimeAgo(userActivity.lastHeartbeat)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs sm:text-sm text-slate-500">No hay usuarios conectados</p>
              </div>
            )}
            
            {!usersLoading && connectedUsers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">
                        {connectedUsers.filter(u => u.presenceStatus === 'online').length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-slate-600">
                        {connectedUsers.filter(u => u.presenceStatus === 'away').length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span className="text-slate-600">
                        {connectedUsers.filter(u => u.presenceStatus === 'offline').length}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-500 font-medium">
                    Total: {connectedUsers.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Second Row Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Actividades Recientes - Responsive */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
              Actividad Reciente
            </h2>
            
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-2 sm:space-x-3 pb-3 sm:pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className={`text-xs font-semibold ${getRoleColor(activity.user.role)}`}>
                          {getRoleIcon(activity.user.role)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-800">
                        <span className="font-medium">{activity.user.name} {activity.user.lastName}</span>
                        {' '}
                        <span className="text-slate-600">{activity.actionDescription}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatActivityTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs sm:text-sm text-slate-500">No hay actividades recientes</p>
              </div>
            )}
          </div>

          {/* Quick Stats - Responsive */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium opacity-90">Proyectos Activos</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">24</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium opacity-90">Evaluaciones</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">12</p>
            </div>
          </div>
        </div>

        {/* Actions Section - Responsive */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {action.description}
                    </p>
                  </div>
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
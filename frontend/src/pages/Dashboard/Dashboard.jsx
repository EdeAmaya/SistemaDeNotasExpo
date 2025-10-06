import React, { useState } from 'react';
import { Settings, X, Calendar, Save } from 'lucide-react';
import useStages from '../../hooks/useStages';
import useConnectedUsers from '../../hooks/useConnectedUsers';
import useRecentActivities from '../../hooks/useRecentActivities';
import usePresence from '../../hooks/usePresence';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const currentUser = "Eduardo";
  
  const { stages, calculateProgress, fetchStages, loading: stagesLoading } = useStages();
  const { fetchWithCookies, API } = useAuth();
  const currentProgress = calculateProgress();
  
  const { 
    connectedUsers, 
    loading: usersLoading, 
    formatTimeAgo,
    getPresenceInfo
  } = useConnectedUsers();
  
  const { recentActivities, loading: activitiesLoading, formatTimeAgo: formatActivityTime } = useRecentActivities();
  
  usePresence();
  
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  
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

  const handleOpenModal = () => {
    setSelectedStage(null);
    setEditingStage(null);
    setShowStageModal(true);
  };

  const handleSelectStage = (stage) => {
    setSelectedStage(stage);
    setEditingStage({ ...stage });
  };

  const handleDateChange = (field, value) => {
    setEditingStage(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStage = async () => {
    try {
      // Validar que tengamos valores válidos
      if (!editingStage.startDate || !editingStage.endDate) {
        toast.error('Por favor selecciona ambas fechas.');
        return;
      }

      // Extraer solo las fechas sin hora para comparación
      // Si ya es formato YYYY-MM-DD, usarlo directamente; si tiene hora, extraerla
      const startDateOnly = editingStage.startDate.includes('T') 
        ? editingStage.startDate.split('T')[0] 
        : editingStage.startDate;
      const endDateOnly = editingStage.endDate.includes('T') 
        ? editingStage.endDate.split('T')[0] 
        : editingStage.endDate;
      
      const start = new Date(startDateOnly + 'T00:00:00');
      const end = new Date(endDateOnly + 'T00:00:00');
      
      if (end <= start) {
        toast.error('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
      }

      const otherStages = stages.filter(s => s._id !== editingStage._id);
      
      for (const otherStage of otherStages) {
        const otherStartOnly = otherStage.startDate.split('T')[0];
        const otherEndOnly = otherStage.endDate.split('T')[0];
        const otherStart = new Date(otherStartOnly + 'T00:00:00');
        const otherEnd = new Date(otherEndOnly + 'T00:00:00');
        
        // Verificar si hay cualquier tipo de solapamiento
        const hasOverlap = (
          (start >= otherStart && start <= otherEnd) || 
          (end >= otherStart && end <= otherEnd) ||
          (start <= otherStart && end >= otherEnd) ||
          (start.getTime() === otherStart.getTime()) ||
          (end.getTime() === otherEnd.getTime())
        );
        
        if (hasOverlap) {
          toast.error(
            `Las fechas se solapan con la etapa "${otherStage.name}". ` +
            `"${otherStage.name}" va del ${formatDate(otherStage.startDate)} al ${formatDate(otherStage.endDate)}.`
          );
          return;
        }
      }

      toast.loading('Actualizando etapa...', { id: 'saving-stage' });

      // Enviar fechas en formato ISO simple (YYYY-MM-DD)
      // Agregamos 'T00:00:00.000Z' para inicio y 'T23:59:59.999Z' para fin
      const startDateISO = `${editingStage.startDate}T00:00:00.000Z`;
      const endDateISO = `${editingStage.endDate}T23:59:59.999Z`;

      console.log('📅 Fechas a enviar:', {
        startDateInput: editingStage.startDate,
        endDateInput: editingStage.endDate,
        startDateISO,
        endDateISO
      });

      const response = await fetchWithCookies(`${API}/stages/${editingStage._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          startDate: startDateISO,
          endDate: endDateISO,
          name: editingStage.name,
          percentage: editingStage.percentage,
          order: editingStage.order,
          isActive: editingStage.isActive,
          description: editingStage.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar etapa');
      }
      
      await fetchStages();
      setShowStageModal(false);
      setSelectedStage(null);
      setEditingStage(null);
      toast.success('Etapa actualizada correctamente', { id: 'saving-stage' });
    } catch (error) {
      console.error('Error actualizando etapa:', error);
      toast.error(error.message || 'Error al actualizar la etapa', { id: 'saving-stage' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getDateValue = (dateString) => {
    // Extraer solo la fecha sin conversión de zona horaria
    const dateOnly = dateString.split('T')[0];
    return dateOnly;
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

        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 relative">
          <button
            onClick={handleOpenModal}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors group"
            title="Configurar fechas de etapas"
          >
            <Settings 
              size={20} 
              className="text-slate-400 group-hover:text-blue-600 group-hover:rotate-90 transition-all duration-300"
            />
          </button>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
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

      {showStageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <Calendar className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedStage ? 'Editar Fechas de Etapa' : 'Seleccionar Etapa'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowStageModal(false);
                  setSelectedStage(null);
                  setEditingStage(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {!selectedStage ? (
                <div className="space-y-3">
                  <p className="text-slate-600 mb-4">
                    Selecciona la etapa que deseas modificar:
                  </p>
                  {stages.map((stage) => (
                    <button
                      key={stage._id}
                      onClick={() => handleSelectStage(stage)}
                      className="w-full bg-slate-50 hover:bg-blue-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg">
                            {stage.name}
                          </h3>
                          <span className="text-sm text-slate-500">
                            Progreso: {stage.percentage}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Orden: {stage.order}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>📅 Inicio: {formatDate(stage.startDate)}</span>
                        <span>📅 Fin: {formatDate(stage.endDate)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setSelectedStage(null);
                      setEditingStage(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
                  >
                    ← Volver a selección de etapas
                  </button>

                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-xl">
                          {editingStage.name}
                        </h3>
                        <span className="text-sm text-slate-500">
                          Progreso: {editingStage.percentage}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Orden: {editingStage.order}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={getDateValue(editingStage.startDate)}
                          onChange={(e) => handleDateChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Actual: {formatDate(editingStage.startDate)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fecha de Fin
                        </label>
                        <input
                          type="date"
                          value={getDateValue(editingStage.endDate)}
                          onChange={(e) => handleDateChange('endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Actual: {formatDate(editingStage.endDate)}
                        </p>
                      </div>
                    </div>

                    {new Date(editingStage.endDate.split('T')[0]) <= new Date(editingStage.startDate.split('T')[0]) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        ⚠️ La fecha de fin debe ser posterior (al menos un día después) a la fecha de inicio
                      </div>
                    )}

                    {editingStage.description && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Descripción:</span> {editingStage.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowStageModal(false);
                  setSelectedStage(null);
                  setEditingStage(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              {selectedStage && (
                <button
                  onClick={handleSaveStage}
                  disabled={new Date(editingStage.endDate.split('T')[0]) <= new Date(editingStage.startDate.split('T')[0])}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>Guardar Cambios</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
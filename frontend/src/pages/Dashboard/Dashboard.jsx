import React, { useState, useEffect } from 'react';
import { Settings, X, Calendar, Save, CalendarDays, User, Clock, TrendingUp, FileText, Users, FolderOpen } from 'lucide-react';
import useStages from '../../hooks/useStages';
import useConnectedUsers from '../../hooks/useConnectedUsers';
import useRecentActivities from '../../hooks/useRecentActivities';
import usePresence from '../../hooks/usePresence';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  useEffect(() => {
    document.title = "Inicio | STC";
  }, []);

  const navigate = useNavigate();

  const { user, fetchWithCookies, API } = useAuth();
  const currentUser = user.name;
  const { stages, calculateProgress, fetchStages, loading: stagesLoading } = useStages();
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
  const [stats, setStats] = useState({ projects: 0, students: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Hook para obtener estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        
        const [projectsRes, studentsRes] = await Promise.all([
          fetchWithCookies(`${API}/projects`),
          fetchWithCookies(`${API}/students`)
        ]);

        const projects = await projectsRes.json();
        const students = await studentsRes.json();

        setStats({
          projects: Array.isArray(projects) ? projects.length : 0,
          students: Array.isArray(students) ? students.length : 0
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        setStats({ projects: 0, students: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [API, fetchWithCookies]);

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
    switch (role) {
      case 'Docente': return '●';
      case 'Evaluador': return '●';
      case 'Admin': return '●';
      default: return '●';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
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
      if (!editingStage.startDate || !editingStage.endDate) {
        toast.error('Por favor selecciona ambas fechas.');
        return;
      }

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

      const startDateISO = `${editingStage.startDate}T00:00:00.000Z`;
      const endDateISO = `${editingStage.endDate}T23:59:59.999Z`;

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
    const dateOnly = dateString.split('T')[0];
    return dateOnly;
  };

  const actions = [
    {
      id: 1,
      title: "Ver Proyectos",
      description: "Consulta todos los proyectos",
      icon: <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: () => navigate('/projects')
    },
    {
      id: 2,
      title: "Crear Evaluación",
      description: "Nueva evaluación académica",
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: () => navigate('/evaluations')
    },
    {
      id: 3,
      title: "Generar Reporte",
      description: "Informes y estadísticas",
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      action: () => navigate('/grades')
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto pt-16">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">

        <div className="mb-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">
                {getCurrentGreeting()},{" "}
                <span className="font-bold text-blue-600">{currentUser}</span>
              </h1>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <CalendarDays className="w-4 h-4" />
                <p className="text-sm sm:text-base capitalize">{getCurrentDate()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-2xl sm:text-3xl font-semibold text-blue-700 tracking-tight">
              {getCurrentTime()}
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white rounded-2xl shadow-md border border-slate-200 p-6 relative overflow-hidden flex flex-col lg:flex-row gap-32">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
              Acerca del Proyecto
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              El <span className="font-semibold text-slate-800">Proyecto Técnico Científico</span> es un proceso de aprendizaje significativo que integra las competencias adquiridas durante el año lectivo para ser aplicadas en la propuesta de solución a una necesidad del entorno social, industrial, económico o cultural.
            </p>
          </div>

          <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 flex-shrink-0">
            <button
              onClick={handleOpenModal}
              className="cursor-pointer absolute top-2 right-2 p-4 rounded-full bg-white shadow-lg hover:bg-blue-50 active:scale-95 transition-all z-10 flex items-center justify-center"
              title="Configurar fechas de etapas"
            >
              <Settings
                size={28}
                className="text-slate-500 hover:text-blue-600 transition-colors"
              />
            </button>

            <svg
              className="transform -rotate-90 w-full h-full"
              viewBox="0 0 192 192"
            >
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
                  currentProgress <= 20
                    ? "#dc2626"
                    : currentProgress <= 40
                      ? "#d97706"
                      : currentProgress <= 60
                        ? "#ca8a04"
                        : currentProgress <= 80
                          ? "#2563eb"
                          : "#059669"
                }
                strokeWidth="12"
                strokeDasharray={`${(currentProgress / 100) * 552.92} 552.92`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-3xl sm:text-4xl font-extrabold ${currentProgress <= 20
                  ? "text-red-600"
                  : currentProgress <= 40
                    ? "text-amber-600"
                    : currentProgress <= 60
                      ? "text-yellow-600"
                      : currentProgress <= 80
                        ? "text-blue-600"
                        : "text-emerald-600"
                  }`}
              >
                {stagesLoading ? "--" : `${currentProgress}%`}
              </span>
            </div>
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
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${presenceInfo.color} ${userActivity.presenceStatus === 'online' ? 'animate-pulse' : ''
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

            {/* Card de Proyectos Activos - Mejorada */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">Proyectos Activos</span>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                </div>
                
                {loadingStats ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-8 bg-white bg-opacity-20 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-black">{stats.projects}</p>
                    <span className="text-sm opacity-75">proyectos</span>
                  </div>
                )}
                
                <div className="mt-3 flex items-center text-xs opacity-90">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>En desarrollo</span>
                </div>
              </div>
            </div>

            {/* Card de Estudiantes - Mejorada */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 rounded-xl shadow-lg p-6 text-white group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">Estudiantes</span>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                
                {loadingStats ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-8 bg-white bg-opacity-20 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-black">{stats.students}</p>
                    <span className="text-sm opacity-75">registrados</span>
                  </div>
                )}
                
                <div className="mt-3 flex items-center text-xs opacity-90">
                  <Users className="w-3 h-3 mr-1" />
                  <span>Total activos</span>
                </div>
              </div>
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
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Inicio: {formatDate(stage.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Fin: {formatDate(stage.endDate)}</span>
                        </div>
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
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
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
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        <span>La fecha de fin debe ser posterior (al menos un día después) a la fecha de inicio</span>
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
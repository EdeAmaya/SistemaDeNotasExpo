import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, GraduationCap, Triangle, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStages from '../hooks/useStages';
import toast from 'react-hot-toast';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Usar el hook de etapas
  const { currentStage, calculateProgress, loading: stagesLoading } = useStages();
  
  // Calcular progreso dinámico
  const progress = calculateProgress();
  
  // Función para obtener el color y texto según el progreso
  const getProgressInfo = (progressValue) => {
    if (progressValue <= 20) {
      return {
        color: 'bg-red-500',
        bgColor: 'bg-red-600',
        textColor: 'text-red-500',
        label: 'Progreso Expo'
      };
    } else if (progressValue <= 40) {
      return {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-600',
        textColor: 'text-yellow-500',
        label: 'Progreso Expo'
      };
    } else if (progressValue <= 60) {
      return {
        color: 'bg-orange-500',
        bgColor: 'bg-orange-600',
        textColor: 'text-orange-500',
        label: 'Progreso Expo'
      };
    } else if (progressValue <= 80) {
      return {
        color: 'bg-blue-500',
        bgColor: 'bg-blue-600',
        textColor: 'text-blue-500',
        label: 'Progreso Expo'
      };
    } else {
      return {
        color: 'bg-green-500',
        bgColor: 'bg-green-600',
        textColor: 'text-green-500',
        label: 'Progreso Expo'
      };
    }
  };

  const progressInfo = getProgressInfo(progress);
  
  // Menús base disponibles para todos los usuarios autenticados
  const baseMenuItems = [
    {
      id: 'dashboard',
      title: 'Inicio',
      icon: Home,
      route: '/',
      roles: ['Admin', 'Docente', 'Evaluador', 'Estudiante']
    }
  ];

  // Menús administrativos (solo para ciertos roles)
  const adminMenuItems = [
    {
      id: 'users',
      title: 'Usuarios',
      icon: Users,
      route: '/users',
      roles: ['Admin']
    },
    {
      id: 'students',
      title: 'Estudiantes',
      icon: GraduationCap,
      route: '/students',
      roles: ['Admin', 'Docente']
    },
    {
      id: 'projects',
      title: 'Proyectos',
      icon: Triangle,
      route: '/projects',
      roles: ['Admin', 'Docente', 'Evaluador']
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones',
      icon: ClipboardList,
      route: '/evaluations',
      roles: ['Admin', 'Docente', 'Evaluador']
    }
  ];

  // Filtrar menús según el rol del usuario
  const getFilteredMenuItems = () => {
    if (!user) return [];
    
    const userRole = user.role;
    const allMenuItems = [...baseMenuItems, ...adminMenuItems];
    
    return allMenuItems.filter(item => 
      item.roles.includes(userRole)
    );
  };

  const menuItems = getFilteredMenuItems();

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      try {
        const result = await logout();
        if (result.success) {
          toast.success(result.message || 'Sesión cerrada exitosamente');
          navigate('/login');
        } else {
          toast.error(result.message || 'Error al cerrar sesión');
        }
      } catch (error) {
        toast.error('Error de conexión');
      }
    }
  };

  const getRoleInfo = (role) => {
    switch(role) {
      case 'Admin':
        return { icon: '👑', color: 'text-purple-400', label: 'Administrador' };
      case 'Docente':
        return { icon: '👨‍🏫', color: 'text-green-400', label: 'Docente' };
      case 'Evaluador':
        return { icon: '👨‍💼', color: 'text-blue-400', label: 'Evaluador' };
      case 'Estudiante':
        return { icon: '🎓', color: 'text-yellow-400', label: 'Estudiante' };
      default:
        return { icon: '👤', color: 'text-gray-400', label: role };
    }
  };

  const roleInfo = user ? getRoleInfo(user.role) : { icon: '👤', color: 'text-gray-400', label: 'Usuario' };

  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col">
      {/* Header con Logo */}
      <div className="pt-8 pb-6 px-6">
        <button 
          onClick={() => handleNavigation('/')}
          className="w-full flex flex-col items-center mb-4 bg-transparent border-none cursor-pointer"
        >
          {/* Logo Circular - Salesianos Ricaldone */}
          <div className="w-20 h-20 mb-4">
            <div className="w-full h-full rounded-full border-4 border-blue-400 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 flex items-center justify-center relative overflow-hidden">
              {/* Silueta de Don Bosco */}
              <div className="w-12 h-12 bg-black rounded-full relative">
                <div className="absolute top-1 left-2 w-8 h-8 bg-yellow-300 rounded-full opacity-80"></div>
                <div className="absolute top-2 left-3 w-2 h-2 bg-black rounded-full"></div>
                <div className="absolute bottom-1 left-1 w-10 h-4 bg-black rounded-t-full"></div>
              </div>
              {/* Texto circular pequeño */}
              <div className="absolute top-1 text-[6px] text-white font-bold">
                SALESIANOS RICALDONE
              </div>
              <div className="absolute bottom-1 text-[6px] text-white font-bold">
                SAN SALVADOR
              </div>
            </div>
          </div>
          
          {/* Nombre del Sistema */}
          <div className="text-white text-center">
            <div className="font-medium text-lg">Salesianos</div>
            <div className="font-bold text-lg">Ricaldone</div>
          </div>
        </button>
      </div>

      {/* Información del Usuario */}
      {user && (
        <div className="px-6 mb-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className={`text-2xl ${roleInfo.color}`}>{roleInfo.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user.name} {user.lastName}
                </p>
                <p className={`text-xs font-medium ${roleInfo.color}`}>
                  {roleInfo.label}
                </p>
                {user.isVerified === false && (
                  <p className="text-red-400 text-xs">No verificado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.route;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg bg-transparent border-none cursor-pointer transition-colors ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <IconComponent size={20} className="mr-3" />
              <span className="font-medium text-sm">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progreso - SOLO LA BARRA CAMBIA DE COLOR */}
      <div className="px-6 py-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-white font-medium mb-3 text-center text-sm">
            Progreso Expo
          </div>
          
          {/* Barra de Progreso - Solo la barra interior cambia de color */}
          <div className="bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className={`${progressInfo.color} h-2 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Porcentaje - Color dinámico según el progreso */}
          <div className={`${progressInfo.textColor} font-bold text-xl text-center`}>
            {stagesLoading ? (
              <div className="animate-pulse">--</div>
            ) : (
              `${progress}%`
            )}
          </div>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 bg-transparent border-none cursor-pointer hover:bg-red-700/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium text-sm">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
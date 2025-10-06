// frontend/src/navigation/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, GraduationCap, Triangle, ClipboardList, LogOut, Menu, X, BookOpenCheck, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStages from '../hooks/useStages';
import toast from 'react-hot-toast';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    },
    {
      id: 'calendar',
      title: 'Calendario',
      icon: Calendar,
      route: '/calendar',
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
    },
    {
      id: 'grades',
      title: 'Notas',
      icon: BookOpenCheck,
      route: '/grades',
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
    <div className="w-56 xl:w-64 bg-gray-900 h-full flex flex-col">
      {/* Header con Logo */}
      <div className="pt-4 pb-3 px-3 flex-shrink-0">
        <button 
          onClick={() => handleNavigation('/')}
          className="w-full flex flex-col items-center mb-3 bg-transparent border-none cursor-pointer"
        >
          {/* Logo Circular - Salesianos Ricaldone */}
          <div className="w-14 h-14 mb-2">
            <div className="w-full h-full rounded-full border-3 border-blue-400 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 flex items-center justify-center relative overflow-hidden">
              {/* Silueta de Don Bosco */}
              <div className="w-9 h-9 bg-black rounded-full relative">
                <div className="absolute top-0.5 left-1.5 w-5 h-5 bg-yellow-300 rounded-full opacity-80"></div>
                <div className="absolute top-1.5 left-2.5 w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="absolute bottom-0.5 left-0.5 w-7 h-2.5 bg-black rounded-t-full"></div>
              </div>
              {/* Texto circular pequeño */}
              <div className="absolute top-0.5 text-[4px] text-white font-bold">
                SALESIANOS RICALDONE
              </div>
              <div className="absolute bottom-0.5 text-[4px] text-white font-bold">
                SAN SALVADOR
              </div>
            </div>
          </div>
          
          {/* Nombre del Sistema */}
          <div className="text-white text-center">
            <div className="font-medium text-sm">Salesianos</div>
            <div className="font-bold text-sm">Ricaldone</div>
          </div>
        </button>
      </div>

      {/* Información del Usuario */}
      {user && (
        <div className="px-3 mb-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-2.5 border border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <span className={`text-lg ${roleInfo.color}`}>{roleInfo.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs truncate">
                  {user.name} {user.lastName}
                </p>
                <p className={`text-[10px] font-medium ${roleInfo.color}`}>
                  {roleInfo.label}
                </p>
                {user.isVerified === false && (
                  <p className="text-red-400 text-[10px]">No verificado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex-1 px-3 min-h-0">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.route;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className={`w-full flex items-center px-3 py-2 mb-1.5 rounded-lg bg-transparent border-none cursor-pointer transition-colors ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <IconComponent size={16} className="mr-2 flex-shrink-0" />
              <span className="font-medium text-xs truncate">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progreso */}
      <div className="px-3 py-3 flex-shrink-0">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-white font-medium mb-2 text-center text-xs">
            Progreso Expo
          </div>
          
          {/* Barra de Progreso */}
          <div className="bg-gray-600 rounded-full h-1.5 mb-2">
            <div 
              className={`${progressInfo.color} h-1.5 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Porcentaje */}
          <div className={`${progressInfo.textColor} font-bold text-base text-center`}>
            {stagesLoading ? (
              <div className="animate-pulse">--</div>
            ) : (
              `${progress}%`
            )}
          </div>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="px-3 pb-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 bg-transparent border-none cursor-pointer hover:bg-red-700/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} className="mr-2 flex-shrink-0" />
          <span className="font-medium text-xs truncate">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
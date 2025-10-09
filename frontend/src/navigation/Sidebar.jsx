import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, GraduationCap, Triangle, ClipboardList, LogOut,
  Menu, X, BookOpenCheck, Calendar, User, UserCheck, UserPlus, UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useStages from '../hooks/useStages';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.svg';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { calculateProgress, loading: stagesLoading } = useStages();
  const progress = calculateProgress();

  const getProgressInfo = (progressValue) => {
    if (progressValue <= 20) return { color: 'bg-red-500', textColor: 'text-red-500' };
    if (progressValue <= 40) return { color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (progressValue <= 60) return { color: 'bg-orange-500', textColor: 'text-orange-500' };
    if (progressValue <= 80) return { color: 'bg-blue-500', textColor: 'text-blue-500' };
    return { color: 'bg-green-500', textColor: 'text-green-500' };
  };

  const progressInfo = getProgressInfo(progress);

  const baseMenuItems = [
    { id: 'dashboard', title: 'Inicio', icon: Home, route: '/', roles: ['Admin', 'Docente', 'Evaluador', 'Estudiante'] },
    { id: 'calendar', title: 'Calendario', icon: Calendar, route: '/calendar', roles: ['Admin', 'Docente', 'Evaluador', 'Estudiante'] }
  ];

  const adminMenuItems = [
    { id: 'users', title: 'Usuarios', icon: Users, route: '/users', roles: ['Admin'] },
    { id: 'students', title: 'Estudiantes', icon: GraduationCap, route: '/students', roles: ['Admin', 'Docente'] },
    { id: 'projects', title: 'Proyectos', icon: Triangle, route: '/projects', roles: ['Admin', 'Estudiante', 'Docente'] },
    { id: 'evaluations', title: 'Evaluaciones', icon: ClipboardList, route: '/evaluations', roles: ['Admin', 'Estudiante', 'Docente'] },
    { id: 'grades', title: 'Notas', icon: BookOpenCheck, route: '/grades', roles: ['Admin', 'Docente', 'Evaluador', 'Estudiante'] }
  ];

  const getFilteredMenuItems = () => {
    if (!user) return [];
    return [...baseMenuItems, ...adminMenuItems].filter(item => item.roles.includes(user.role));
  };

  const menuItems = getFilteredMenuItems();

  const handleNavigation = (route) => {
    navigate(route);
    setIsMobileMenuOpen(false);
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
    switch (role) {
      case 'Admin': return { icon: UserPlus, color: 'text-purple-400', label: 'Administrador' };
      case 'Docente': return { icon: UserCheck, color: 'text-green-400', label: 'Docente' };
      case 'Evaluador': return { icon: User, color: 'text-blue-400', label: 'Evaluador' };
      case 'Estudiante': return { icon: UserX, color: 'text-yellow-400', label: 'Estudiante' };
      default: return { icon: User, color: 'text-gray-400', label: role };
    }
  };

  const roleInfo = user ? getRoleInfo(user.role) : { icon: User, color: 'text-gray-400', label: 'Usuario' };
  const RoleIcon = roleInfo.icon;

  return (
    <>
      {/* Botón hamburguesa solo en móviles */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white flex items-center justify-between px-4 py-3 z-40">
        <button onClick={() => setIsMobileMenuOpen(true)} className="cursor-pointer flex items-center gap-2">
          <Menu size={22} />
          <span className="font-medium text-sm">Menú</span>
        </button>
        <img src={logoImg} alt="Logo" className="w-10 h-10 object-contain" />
      </div>

      {/* Fondo oscuro para móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gray-900 flex flex-col w-56 xl:w-64 h-full md:static md:translate-x-0 
        transform transition-transform duration-300 fixed top-0 left-0 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Cerrar menú móvil */}
        <div className="flex items-center justify-between p-3 md:hidden">
          <h2 className="text-white text-sm font-semibold">Menú</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
            <X size={20} />
          </button>
        </div>

        {/* Logo (solo desktop) */}
        <div className="pt-4 pb-3 px-3 flex-shrink-0 hidden md:flex flex-col items-center">
          <button onClick={() => handleNavigation('/')} className="flex flex-col items-center">
            <img src={logoImg} alt="Logo Salesianos Ricaldone" className="w-32 h-32 mb-2 object-contain" />
            <div className="text-white text-center">
              <div className="font-medium text-sm">Salesianos</div>
              <div className="font-bold text-sm">Ricaldone</div>
            </div>
          </button>
        </div>

        {/* Usuario */}
        {user && (
          <div className="px-3 mb-3 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-2.5 border border-gray-700 flex items-center gap-2">
              <RoleIcon size={20} className={roleInfo.color} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs truncate">
                  {user.name} {user.lastName}
                </p>
                <p className={`text-[10px] font-medium ${roleInfo.color}`}>{roleInfo.label}</p>
                {user.isVerified === false && (
                  <p className="text-red-400 text-[10px]">No verificado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex-1 px-3 min-h-0 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.route;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={`w-full flex items-center px-3 py-2 mb-1.5 rounded-lg border-none cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <IconComponent size={16} className="mr-2 flex-shrink-0" />
                <span className="font-medium text-xs truncate">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Progreso */}
        <div className="px-3 py-3 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-white font-medium mb-2 text-center text-xs">Progreso Expo</div>
            <div className="bg-gray-600 rounded-full h-1.5 mb-2">
              <div
                className={`${progressInfo.color} h-1.5 rounded-full transition-all duration-500 ease-in-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`${progressInfo.textColor} font-bold text-base text-center`}>
              {stagesLoading ? <div className="animate-pulse">--</div> : `${progress}%`}
            </div>
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 bg-transparent border-none cursor-pointer hover:bg-red-700/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} className="mr-2 flex-shrink-0" />
            <span className="font-medium text-xs truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavBar;

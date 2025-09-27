import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, GraduationCap, Triangle, ClipboardList, LogOut } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const progress = 30;
  
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Inicio',
      icon: Home,
      route: '/'
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: Users,
      route: '/users'
    },
    {
      id: 'students',
      title: 'Estudiantes',
      icon: GraduationCap,
      route: '/students'
    },
    {
      id: 'projects',
      title: 'Proyectos',
      icon: Triangle,
      route: '/projects'
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones',
      icon: ClipboardList,
      route: '/evaluations'
    }
  ];

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
  };

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

      {/* Progreso */}
      <div className="px-6 py-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-white font-medium mb-3 text-center text-sm">
            Progreso Expo
          </div>
          
          {/* Barra de Progreso */}
          <div className="bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Porcentaje */}
          <div className="text-red-500 font-bold text-xl text-center">
            {progress}%
          </div>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 bg-transparent border-none cursor-pointer hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
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
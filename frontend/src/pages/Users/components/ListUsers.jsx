import React, { useState } from "react";
import UserCard from "./UserCard";

const ListUsers = ({ users, loading, deleteUser, updateUser }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar usuarios por rol
  const filteredUsers = users.filter(user => {
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleStats = () => {
    const stats = {
      all: users.length,
      Admin: users.filter(u => u.role === 'Admin').length,
      Docente: users.filter(u => u.role === 'Docente').length,
      Evaluador: users.filter(u => u.role === 'Evaluador').length
    };
    return stats;
  };

  const stats = getRoleStats();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
          <h1 className="text-4xl font-black text-blue-800 tracking-wide">
            Usuarios del Sistema
          </h1>
        </div>
        
        {/* Línea decorativa */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-600 rounded-full"></div>
          <div className="h-2 w-8 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full shadow-md"></div>
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-blue-100 shadow-lg">
        {/* Filtros por rol */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { key: 'all', label: 'Todos', icon: '👥' },
            { key: 'Admin', label: 'Administradores', icon: '👑' },
            { key: 'Docente', label: 'Docentes', icon: '👨‍🏫' },
            { key: 'Evaluador', label: 'Evaluadores', icon: '👨‍💼' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-300'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-black">
                {stats[filter.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
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
            <p className="text-blue-700 font-bold text-lg">Cargando usuarios...</p>
            <p className="text-blue-500 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!users || users.length === 0) && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-blue-600">👥</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-blue-800">¡No hay usuarios registrados!</h3>
            <p className="text-blue-600 max-w-md mx-auto">
              Aún no se han registrado usuarios en el sistema. 
              ¡Comienza agregando el primer usuario!
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && users.length > 0 && filteredUsers.length === 0 && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-gray-500">🔍</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">No se encontraron resultados</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No hay usuarios que coincidan con los filtros seleccionados.
            </p>
          </div>
        </div>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length > 0 && (
        <>
          {/* Contador de resultados */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-full border-2 border-blue-300 shadow-lg">
              <span className="text-blue-700 font-bold">Mostrando:</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-black text-sm shadow-inner">
                {filteredUsers.length}
              </span>
              <span className="text-blue-700 font-bold">
                {filteredUsers.length === 1 ? 'Usuario' : 'Usuarios'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
            {filteredUsers.map((user, index) => (
              <div
                key={user._id}
                className="animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <UserCard
                  user={user}
                  deleteUser={deleteUser}
                  updateUser={updateUser}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
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

export default ListUsers;
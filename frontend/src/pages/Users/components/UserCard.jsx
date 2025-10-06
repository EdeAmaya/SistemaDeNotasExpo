import React from "react";
import { Crown, GraduationCap, Briefcase, User, Mail, Calendar, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const UserCard = ({ user, deleteUser, updateUser, viewMode = 'list' }) => {
  
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${user.name} ${user.lastName}?`)) {
      deleteUser(user._id);
    }
  };

  const handleEdit = () => {
    updateUser(user);
  };

  const getRoleInfo = (role) => {
    switch(role) {
      case 'Admin':
        return { 
          icon: Crown, 
          gradient: 'from-orange-500 via-orange-600 to-orange-700', 
          bg: 'bg-orange-500',
          text: 'Administrador'
        };
      case 'Docente':
        return { 
          icon: GraduationCap, 
          gradient: 'from-orange-500 via-orange-600 to-orange-700', 
          bg: 'bg-orange-500',
          text: 'Docente'
        };
      case 'Evaluador':
        return { 
          icon: Briefcase, 
          gradient: 'from-orange-500 via-orange-600 to-orange-700', 
          bg: 'bg-orange-500',
          text: 'Evaluador'
        };
      case 'Estudiante':
        return { 
          icon: User, 
          gradient: 'from-orange-500 via-orange-600 to-orange-700', 
          bg: 'bg-orange-500',
          text: 'Estudiante'
        };
      default:
        return { 
          icon: User, 
          gradient: 'from-gray-500 via-gray-600 to-gray-700', 
          bg: 'bg-gray-500',
          text: role
        };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  // Vista de Lista (Horizontal) - Responsive
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        
        {/* Barra lateral colorida */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-orange-500`}></div>
        
        <div className="pl-3 sm:pl-4 pr-3 sm:pr-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          
          {/* Avatar con icono */}
          <div className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 self-start sm:self-auto`}>
            <RoleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            
            {/* Indicador de verificación */}
            {user.isVerified ? (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                {user.name} {user.lastName}
              </h3>
              
              {/* Badge de rol */}
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 ${roleInfo.bg} text-white rounded-lg text-[10px] sm:text-xs font-bold shadow-sm`}>
                <RoleIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">{roleInfo.text}</span>
              </span>
            </div>

            {/* Email y fecha */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 min-w-0">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-medium truncate">{user.email}</span>
              </div>
              <div className="hidden md:flex items-center gap-1 sm:gap-1.5 text-gray-500">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs">
                  {new Date(user.createdAt).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción - Responsive */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
            <button
              onClick={handleEdit}
              className="cursor-pointer px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Editar usuario"
            >
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Editar</span>
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              className="cursor-pointer px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-[10px] sm:text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Eliminar usuario"
            >
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xl:inline">Eliminar</span>
              </span>
            </button>
          </div>
        </div>

        {/* Barra de progreso inferior en hover */}
        <div className={`h-0.5 bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid) - Responsive
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      
      {/* Header con gradiente */}
      <div className={`relative bg-orange-500 p-4 sm:p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 sm:mb-3">
              <RoleIcon className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-base sm:text-xl font-black mb-1 line-clamp-2">{user.name} {user.lastName}</h3>
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] sm:text-xs font-bold">
              {roleInfo.text}
            </div>
          </div>
          
          {/* Badge de verificación */}
          {user.isVerified ? (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Body del card */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        
        {/* Email */}
        <div className="flex items-center gap-2 text-gray-700 min-w-0">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium break-all">{user.email}</span>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-medium">
            Creado el {new Date(user.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Estado de verificación */}
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg ${
          user.isVerified 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            user.isVerified ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs sm:text-sm font-bold ${
            user.isVerified ? 'text-green-700' : 'text-red-700'
          }`}>
            {user.isVerified ? 'Usuario Verificado' : 'Verificación Pendiente'}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 sm:gap-3 pt-2">
          <button
            onClick={handleEdit}
            className="cursor-pointer flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Editar</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className={`h-2 bg-orange-500`}></div>
    </div>
  );
};

export default UserCard;
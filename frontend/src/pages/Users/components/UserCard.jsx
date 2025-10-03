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
          gradient: 'from-purple-500 via-purple-600 to-purple-700', 
          bg: 'bg-purple-500',
          text: 'Administrador'
        };
      case 'Docente':
        return { 
          icon: GraduationCap, 
          gradient: 'from-green-500 via-green-600 to-green-700', 
          bg: 'bg-green-500',
          text: 'Docente'
        };
      case 'Evaluador':
        return { 
          icon: Briefcase, 
          gradient: 'from-blue-500 via-blue-600 to-blue-700', 
          bg: 'bg-blue-500',
          text: 'Evaluador'
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

  // Vista de Lista (Horizontal)
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        
        {/* Barra lateral colorida */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${roleInfo.gradient}`}></div>
        
        <div className="pl-4 pr-5 py-4 flex items-center gap-5">
          
          {/* Avatar con icono */}
          <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${roleInfo.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <RoleIcon className="w-8 h-8 text-white" />
            
            {/* Indicador de verificación */}
            {user.isVerified ? (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {user.name} {user.lastName}
              </h3>
              
              {/* Badge de rol */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${roleInfo.bg} text-white rounded-lg text-xs font-bold shadow-sm`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleInfo.text}</span>
              </span>
            </div>

            {/* Email y fecha */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="font-medium truncate max-w-xs">{user.email}</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
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

          {/* Botones de acción */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Editar usuario"
            >
              <span className="flex items-center gap-1.5">
                <Edit2 className="w-4 h-4" />
                <span className="hidden xl:inline">Editar</span>
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
              title="Eliminar usuario"
            >
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span className="hidden xl:inline">Eliminar</span>
              </span>
            </button>
          </div>
        </div>

        {/* Barra de progreso inferior en hover */}
        <div className={`h-0.5 bg-gradient-to-r ${roleInfo.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      </div>
    );
  }

  // Vista de Tarjetas (Grid)
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden">
      
      {/* Header con gradiente */}
      <div className={`relative bg-gradient-to-r ${roleInfo.gradient} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3">
              <RoleIcon className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black mb-1">{user.name} {user.lastName}</h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold">
              {roleInfo.text}
            </div>
          </div>
          
          {/* Badge de verificación */}
          {user.isVerified ? (
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

      {/* Body del card */}
      <div className="p-6 space-y-4">
        
        {/* Email */}
        <div className="flex items-center gap-2 text-gray-700">
          <Mail className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium break-all">{user.email}</span>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">
            Creado el {new Date(user.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Estado de verificación */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
          user.isVerified 
            ? 'bg-green-50 border-2 border-green-200' 
            : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            user.isVerified ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-bold ${
            user.isVerified ? 'text-green-700' : 'text-red-700'
          }`}>
            {user.isVerified ? 'Usuario Verificado' : 'Verificación Pendiente'}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className={`h-2 bg-gradient-to-r ${roleInfo.gradient}`}></div>
    </div>
  );
};

export default UserCard;
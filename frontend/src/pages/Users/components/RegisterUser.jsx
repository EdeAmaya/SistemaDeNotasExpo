import React from 'react';
import { User, Mail, Lock, Shield, Crown, GraduationCap, Briefcase, Edit2, UserPlus, CheckCircle, Info } from 'lucide-react';

const RegisterUser = ({
  name, setName,
  lastName, setLastName,
  email, setEmail,
  password, setPassword,
  role, setRole,
  isVerified, setIsVerified,
  saveUser,
  id,
  handleEdit,
  onCancel
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      handleEdit(e);
    } else {
      saveUser(e);
    }
  };

  const roles = [
    { 
      value: 'Admin', 
      label: 'Administrador', 
      icon: Crown, 
      gradient: 'from-purple-500 to-purple-700',
      description: 'Control total del sistema'
    },
    { 
      value: 'Docente', 
      label: 'Docente', 
      icon: GraduationCap, 
      gradient: 'from-green-500 to-green-700',
      description: 'Gestión académica'
    },
    { 
      value: 'Evaluador', 
      label: 'Evaluador', 
      icon: Briefcase, 
      gradient: 'from-blue-500 to-blue-700',
      description: 'Evaluación de proyectos'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'} flex items-center justify-center shadow-lg flex-shrink-0`}>
            {id ? <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {id ? 'Actualiza la información del usuario' : 'Completa los datos para registrar un nuevo usuario'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* Información Personal - Responsive */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Información Personal</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="Ej: Juan"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={lastName || ''}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="Ej: Pérez"
                required
              />
            </div>
          </div>
        </div>

        {/* Credenciales - Responsive */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Credenciales de Acceso</span>
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Correo Electrónico *</span>
              </label>
              <input
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder="usuario@ricaldone.edu.sv"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  Contraseña {id && '(dejar vacío para mantener actual)'}
                  {!id && ' *'}
                </span>
              </label>
              <input
                type="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-xs sm:text-base"
                placeholder={id ? "Nueva contraseña (opcional)" : "Contraseña segura"}
                required={!id}
              />
              {!id && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Usa al menos 8 caracteres con números y letras
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rol del Usuario - Responsive */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Rol del Usuario *</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {roles.map((roleOption) => {
              const IconComponent = roleOption.icon;
              return (
                <label
                  key={roleOption.value}
                  className={`relative cursor-pointer group ${
                    role === roleOption.value ? 'scale-105' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleOption.value}
                    checked={role === roleOption.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className={`p-4 sm:p-5 rounded-xl border-3 text-center transition-all duration-300 ${
                    role === roleOption.value
                      ? `bg-gradient-to-br ${roleOption.gradient} text-white shadow-lg border-transparent`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${
                      role === roleOption.value ? 'text-white' : 'text-gray-700'
                    }`} />
                    <div className={`font-bold text-sm sm:text-base mb-1 ${
                      role === roleOption.value ? 'text-white' : 'text-gray-900'
                    }`}>
                      {roleOption.label}
                    </div>
                    <div className={`text-xs ${
                      role === roleOption.value ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {roleOption.description}
                    </div>
                    
                    {role === roleOption.value && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Verificación - Responsive */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-gray-200">
          <label className="flex items-center gap-3 sm:gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-all duration-300 ${
                isVerified ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isVerified ? 'translate-x-5 sm:translate-x-6' : ''
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Usuario Verificado</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Los usuarios verificados tienen acceso completo al sistema
              </p>
            </div>
          </label>
        </div>

        {/* Botones de Acción - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="submit"
            className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
              id
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
            }`}
          >
            {id ? <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>{id ? 'Actualizar Usuario' : 'Registrar Usuario'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>↩️</span>
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Info adicional - Responsive */}
      <div className="mt-4 sm:mt-6 bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg">
        <div className="flex gap-2 sm:gap-3">
          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1 text-xs sm:text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Campos obligatorios</p>
            <p>Todos los campos marcados con (*) son obligatorios{id && ', excepto la contraseña al editar'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
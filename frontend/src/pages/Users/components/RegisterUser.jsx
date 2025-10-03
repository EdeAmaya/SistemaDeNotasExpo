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
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ${id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'} flex items-center justify-center shadow-lg`}>
            {id ? <Edit2 className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {id ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-sm text-gray-500">
              {id ? 'Actualiza la información del usuario' : 'Completa los datos para registrar un nuevo usuario'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Información Personal */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>Información Personal</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                placeholder="Ej: Juan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={lastName || ''}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                placeholder="Ej: Pérez"
                required
              />
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span>Credenciales de Acceso</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Correo Electrónico *</span>
              </label>
              <input
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                placeholder="usuario@ricaldone.edu.sv"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>
                  Contraseña {id && '(dejar vacío para mantener actual)'}
                  {!id && ' *'}
                </span>
              </label>
              <input
                type="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
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

        {/* Rol del Usuario */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Rol del Usuario *</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
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
                  <div className={`p-5 rounded-xl border-3 text-center transition-all duration-300 ${
                    role === roleOption.value
                      ? `bg-gradient-to-br ${roleOption.gradient} text-white shadow-lg border-transparent`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <IconComponent className={`w-10 h-10 mx-auto mb-3 ${
                      role === roleOption.value ? 'text-white' : 'text-gray-700'
                    }`} />
                    <div className={`font-bold mb-1 ${
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
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Verificación */}
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${
                isVerified ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isVerified ? 'translate-x-6' : ''
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span>Usuario Verificado</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Los usuarios verificados tienen acceso completo al sistema
              </p>
            </div>
          </label>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${
              id
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
            }`}
          >
            {id ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <span>{id ? 'Actualizar Usuario' : 'Registrar Usuario'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>↩️</span>
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Campos obligatorios</p>
            <p>Todos los campos marcados con (*) son obligatorios{id && ', excepto la contraseña al editar'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
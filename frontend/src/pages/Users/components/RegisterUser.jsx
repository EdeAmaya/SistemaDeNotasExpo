import React from 'react';

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
    { value: 'Admin', label: 'Administrador', icon: '👑', color: 'purple' },
    { value: 'Docente', label: 'Docente', icon: '👨‍🏫', color: 'green' },
    { value: 'Evaluador', label: 'Evaluador', icon: '👨‍💼', color: 'blue' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header del formulario */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg">
            <span className="text-3xl">{id ? '✏️' : '👥'}</span>
          </div>
          <h2 className="text-3xl font-black text-blue-800">
            {id ? 'Editar Usuario' : 'Nuevo Usuario del Sistema'}
          </h2>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full max-w-xs mx-auto shadow-sm"></div>
      </div>

      <form className="bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-blue-100" onSubmit={handleSubmit}>
        {/* Header decorativo del formulario */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6">
          <h3 className="text-white text-xl font-bold text-center">
            Información del Usuario
          </h3>
        </div>

        <div className="p-8 space-y-6 bg-gradient-to-b from-white to-blue-50">
          {/* Nombres y Apellidos en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Nombre */}
            <div className="group">
              <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
                <span className="bg-blue-600 text-white p-1 rounded-full text-sm">👤</span>
                <span>Nombre</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                  placeholder="Ej: Juan"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-blue-400 text-xl">📝</span>
                </div>
              </div>
            </div>

            {/* Campo Apellido */}
            <div className="group">
              <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
                <span className="bg-blue-600 text-white p-1 rounded-full text-sm">👤</span>
                <span>Apellido</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={lastName || ''}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                  placeholder="Ej: Pérez"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className="text-blue-400 text-xl">📝</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campo Email */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-blue-600 text-white p-1 rounded-full text-sm">📧</span>
              <span>Email</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                placeholder="usuario@ricaldone.edu.sv"
                required
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-blue-400 text-xl">✉️</span>
              </div>
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-blue-600 text-white p-1 rounded-full text-sm">🔒</span>
              <span>Contraseña {id && '(Dejar en blanco para mantener actual)'}</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 border-3 border-blue-200 rounded-xl text-gray-800 font-medium shadow-inner bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                placeholder={id ? "Nueva contraseña (opcional)" : "Contraseña segura"}
                required={!id}
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-blue-400 text-xl">🔐</span>
              </div>
            </div>
          </div>

          {/* Campo Rol */}
          <div className="group">
            <label className="flex items-center space-x-2 text-blue-800 font-bold text-lg mb-3">
              <span className="bg-blue-600 text-white p-1 rounded-full text-sm">🏷️</span>
              <span>Rol del Usuario</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((roleOption) => (
                <label
                  key={roleOption.value}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    role === roleOption.value ? 'scale-105' : 'hover:scale-102'
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
                  <div className={`p-4 rounded-xl border-3 text-center transition-all duration-300 ${
                    role === roleOption.value
                      ? `border-${roleOption.color}-500 bg-${roleOption.color}-100 shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <div className="text-3xl mb-2">{roleOption.icon}</div>
                    <div className={`font-bold ${
                      role === roleOption.value ? `text-${roleOption.color}-800` : 'text-gray-700'
                    }`}>
                      {roleOption.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Campo Verificado */}
          <div className="group">
            <label className="flex items-center space-x-3 cursor-pointer bg-gray-100 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                name="isVerified"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="flex items-center space-x-2">
                <span className="bg-green-600 text-white p-1 rounded-full text-sm">✅</span>
                <span className="text-blue-800 font-bold text-lg">Usuario Verificado</span>
              </div>
            </label>
            <p className="text-gray-600 text-sm mt-2 ml-8">
              Los usuarios verificados tienen acceso completo al sistema
            </p>
          </div>

          {/* Botones de acción */}
          <div className="pt-6 space-y-4">
            {!id ? (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-blue-500 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">💾</span>
                <span>Registrar Usuario</span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-500 hover:from-emerald-600 hover:via-blue-500 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-4 border-emerald-400 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">✏️</span>
                <span>Actualizar Usuario</span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-400 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">↩️</span>
                <span>Cancelar</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer decorativo del formulario */}
        <div className="h-3 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
      </form>

      {/* Información adicional */}
      <div className="mt-8 bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-blue-800 font-bold text-lg mb-2">Roles del Sistema:</h4>
            <ul className="text-blue-700 space-y-1 text-sm font-medium">
              <li>• <strong>👑 Administrador:</strong> Acceso completo al sistema</li>
              <li>• <strong>👨‍🏫 Docente:</strong> Gestión de proyectos y evaluaciones</li>
              <li>• <strong>👨‍💼 Evaluador:</strong> Evaluación de proyectos estudiantiles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota sobre campos obligatorios */}
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <p className="text-blue-700 text-sm font-medium">
          <span className="font-bold">*</span> Todos los campos son obligatorios excepto la contraseña al editar
        </p>
      </div>
    </div>
  );
};

export default RegisterUser;

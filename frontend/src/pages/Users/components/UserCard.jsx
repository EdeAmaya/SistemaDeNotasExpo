import React from "react";

const UserCard = ({ user, deleteUser, updateUser }) => {
  
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteUser(user._id);
    }
  };

  const handleEdit = () => {
    updateUser(user);
  };

  // Determinar el icono y color según el rol
  const getRoleInfo = (role) => {
    switch(role) {
      case 'Admin':
        return { icon: '👑', color: 'purple', bg: 'purple-500', text: 'Administrador' };
      case 'Docente':
        return { icon: '👨‍🏫', color: 'green', bg: 'green-500', text: 'Docente' };
      case 'Evaluador':
        return { icon: '👨‍💼', color: 'blue', bg: 'blue-500', text: 'Evaluador' };
      default:
        return { icon: '👤', color: 'gray', bg: 'gray-500', text: role };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="group max-w-sm mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-blue-100 hover:border-blue-300 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
      {/* Header del usuario */}
      <div className={`relative bg-gradient-to-r from-${roleInfo.color}-400 to-${roleInfo.color}-600 p-6`}>
        <div className="text-center">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl">{roleInfo.icon}</span>
          </div>
          <h2 className="text-white font-black text-xl">
            {user.name} {user.lastName}
          </h2>
          <p className="text-white/90 font-medium">{roleInfo.text}</p>
        </div>
        
        {/* Badge de verificación */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            user.isVerified 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {user.isVerified ? '✅ Verificado' : '❌ No Verificado'}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50">
        {/* Información del usuario */}
        <div className="space-y-3 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 text-sm font-bold mb-1">📧 Email</div>
            <div className="text-gray-800 font-medium break-all">{user.email}</div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 text-sm font-bold mb-1">🏷️ Rol</div>
            <div className={`inline-block px-3 py-1 rounded-full text-white font-bold bg-${roleInfo.bg}`}>
              {roleInfo.icon} {roleInfo.text}
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 text-sm font-bold mb-1">📅 Creado</div>
            <div className="text-gray-800 font-medium">
              {new Date(user.createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 flex items-center justify-center space-x-2"
          >
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-300 flex items-center justify-center space-x-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Elemento decorativo inferior */}
      <div className={`h-2 bg-gradient-to-r from-${roleInfo.color}-600 via-${roleInfo.color}-400 to-${roleInfo.color}-600`}></div>
    </div>
  );
};

export default UserCard;
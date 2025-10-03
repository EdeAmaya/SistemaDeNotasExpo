import React, { useState } from 'react';
import { Users as UsersIcon, UserPlus, Crown, GraduationCap, Briefcase, CheckCircle, Info } from 'lucide-react';
import ListUsers from './components/ListUsers';
import RegisterUser from './components/RegisterUser';
import useDataUsers from './hooks/useDataUsers';

const Users = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    users,
    loading,
    id,
    name,
    lastName,
    email,
    password,
    role,
    isVerified,
    setName,
    setLastName,
    setEmail,
    setPassword,
    setRole,
    setIsVerified,
    saveUser,
    deleteUser,
    updateUser,
    handleEdit,
    clearForm
  } = useDataUsers();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      clearForm();
    }
  };

  const handleCancelEdit = () => {
    clearForm();
    setActiveTab('list');
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    docentes: users.filter(u => u.role === 'Docente').length,
    evaluadores: users.filter(u => u.role === 'Evaluador').length,
    verificados: users.filter(u => u.isVerified).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Header Superior */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-blue-600 font-semibold">Gestión de Usuarios</span>
              </div>
              <div className="flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-black text-gray-900">
                  Usuarios del Sistema
                </h1>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.admins}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Admins</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.docentes}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Docentes</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-center">{stats.evaluadores}</div>
                <div className="text-xs font-semibold opacity-90 text-center">Evaluadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('list')}
              className={`relative px-6 py-4 font-bold text-sm transition-all duration-300 ${
                activeTab === 'list' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                <span>Lista de Usuarios</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                  {stats.total}
                </span>
              </div>
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full"></div>
              )}
            </button>
            
            <button
              onClick={() => handleTabChange('register')}
              className={`relative px-6 py-4 font-bold text-sm transition-all duration-300 ${
                activeTab === 'register' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>{id ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
              </div>
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Stats móvil */}
        <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl shadow-lg text-center">
            <Crown className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.admins}</div>
            <div className="text-xs font-semibold opacity-90">Admins</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-xl shadow-lg text-center">
            <GraduationCap className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.docentes}</div>
            <div className="text-xs font-semibold opacity-90">Docentes</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-lg text-center">
            <Briefcase className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-black">{stats.evaluadores}</div>
            <div className="text-xs font-semibold opacity-90">Evaluadores</div>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === 'list' ? (
            <ListUsers 
              users={users}
              loading={loading}
              deleteUser={deleteUser}
              updateUser={(user) => {
                updateUser(user);
                setActiveTab('register');
              }}
            />
          ) : (
            <div className="p-8">
              <RegisterUser
                name={name}
                setName={setName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                role={role}
                setRole={setRole}
                isVerified={isVerified}
                setIsVerified={setIsVerified}
                saveUser={saveUser}
                id={id}
                handleEdit={handleEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">Gestión de Usuarios</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span><span className="font-semibold text-gray-800">Administrador:</span> Control total</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Docente:</span> Gestión académica</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span><span className="font-semibold text-gray-800">Evaluador:</span> Evaluación de proyectos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><span className="font-semibold text-gray-800">Verificación:</span> Acceso completo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
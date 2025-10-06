import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Crown, GraduationCap, Briefcase, CheckCircle, Info, User } from 'lucide-react';
import ListUsers from './components/ListUsers';
import RegisterUser from './components/RegisterUser';
import useDataUsers from './hooks/useDataUsers';

const Users = () => {
  useEffect(() => {
    document.title = "Usuarios | STC";
  }, []);

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
    estudiantes: users.filter(u => u.role === 'Estudiante').length,
    verificados: users.filter(u => u.isVerified).length,
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Header Superior - Responsive */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 lg:pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                <span>Sistema</span>
                <span>›</span>
                <span className="text-orange-600 font-semibold">Gestión de Usuarios</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                  Usuarios del Sistema
                </h1>
              </div>
            </div>

            {/* Stats - Responsive */}
            <div className="grid grid-cols-3 lg:flex lg:items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-orange-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.admins}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Admins</div>
              </div>
              <div className="bg-orange-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.docentes}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Docentes</div>
              </div>
              <div className="bg-orange-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-lg">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-center">{stats.evaluadores}</div>
                <div className="text-[10px] sm:text-xs font-semibold opacity-90 text-center">Evaluadores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 lg:static z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleTabChange('list')}
              className={`cursor-pointer relative px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === 'list' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Lista de Usuarios</span>
                <span className="sm:hidden">Lista</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-black">
                  {stats.total}
                </span>
              </div>
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange('register')}
              className={`cursor-pointer relative px-4 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${activeTab === 'register' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">{id ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
                <span className="sm:hidden">{id ? 'Editar' : 'Nuevo'}</span>
              </div>
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

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
            <div className="p-4 sm:p-6 lg:p-8">
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

        {/* Footer - Responsive */}
        <div className="mt-4 sm:mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-5 rounded-r-xl">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Gestión de Usuarios</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Administrador:</span> Control total</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Docente:</span> Gestión académica</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Evaluador:</span> Evaluación de proyectos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">Verificación:</span> Acceso completo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Users;
import React, { useState } from 'react';
import ListUsers from './components/ListUsers';
import RegisterUser from './components/RegisterUser';
import useDataUsers from './hooks/useDataUsers';

const Users = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    // Estados
    users,
    loading,
    id,
    name,
    lastName,
    email,
    password,
    role,
    isVerified,
    
    // Setters
    setName,
    setLastName,
    setEmail,
    setPassword,
    setRole,
    setIsVerified,
    
    // Funciones
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white text-blue-700 p-4 rounded-full shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-wide drop-shadow-lg">
                  Usuarios del Sistema
                </h1>
                <p className="text-blue-200 text-lg font-medium mt-1">
                  Gestión de administradores, docentes y evaluadores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-4">
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex">
            <button
              onClick={() => handleTabChange('list')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Usuarios del Sistema
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'register'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {id ? 'Editar Usuario' : 'Crear Usuario +'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
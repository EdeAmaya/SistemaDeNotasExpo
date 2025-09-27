// ====== Students.jsx (Página principal) ======
import React, { useState } from 'react';
import ListStudents from './components/ListStudents';
import RegisterStudent from './components/RegisterStudent';
import useDataStudents from './hooks/useDataStudents';

const Students = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  const {
    // Estados
    students,
    loading,
    id,
    studentCode,
    name,
    lastName,
    idLevel,
    idSection,
    idSpecialty,
    projectId,
    
    // Setters
    setStudentCode,
    setName,
    setLastName,
    setIdLevel,
    setIdSection,
    setIdSpecialty,
    setProjectId,
    
    // Funciones
    saveStudent,
    deleteStudent,
    updateStudent,
    handleEdit,
    clearForm
  } = useDataStudents();

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
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-8 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white text-green-700 p-4 rounded-full shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-wide drop-shadow-lg">
                  Estudiantes Comunes
                </h1>
                <p className="text-green-200 text-lg font-medium mt-1">
                  Gestión de estudiantes del centro educativo
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nota explicativa en el header */}
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-green-800/50 backdrop-blur-sm border border-green-400/30 p-4 rounded-lg">
            <p className="text-green-100 text-sm font-medium">
              <span className="font-bold">💡 Estudiantes Comunes:</span> Registros académicos para gestión de proyectos, niveles y secciones. 
              Para usuarios estudiantes con acceso al sistema, consulta la sección <strong>"Usuarios"</strong>.
            </p>
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
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📚 Estudiantes Comunes
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {id ? '✏️ Editar Estudiante' : '➕ Registrar Estudiante'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {activeTab === 'list' ? (
            <ListStudents 
              students={students}
              loading={loading}
              deleteStudent={deleteStudent}
              updateStudent={(student) => {
                updateStudent(student);
                setActiveTab('register');
              }}
            />
          ) : (
            <RegisterStudent
              studentCode={studentCode}
              setStudentCode={setStudentCode}
              name={name}
              setName={setName}
              lastName={lastName}
              setLastName={setLastName}
              idLevel={idLevel}
              setIdLevel={setIdLevel}
              idSection={idSection}
              setIdSection={setIdSection}
              idSpecialty={idSpecialty}
              setIdSpecialty={setIdSpecialty}
              projectId={projectId}
              setProjectId={setProjectId}
              saveStudent={saveStudent}
              id={id}
              handleEdit={handleEdit}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-xl border-2 border-green-200 shadow-lg">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📋</span>
            <div>
              <h4 className="text-green-800 font-bold text-lg mb-2">Gestión de Estudiantes Comunes:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700 text-sm font-medium">
                <div>
                  <h5 className="font-bold mb-1">📚 Información Académica:</h5>
                  <ul className="space-y-1">
                    <li>• Código único de estudiante</li>
                    <li>• Nivel educativo y sección</li>
                    <li>• Especialidad (opcional)</li>
                    <li>• Proyecto asignado (opcional)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold mb-1">🎯 Funcionalidades:</h5>
                  <ul className="space-y-1">
                    <li>• Registro y edición de datos</li>
                    <li>• Asignación de proyectos</li>
                    <li>• Filtros y búsqueda avanzada</li>
                    <li>• Estadísticas académicas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
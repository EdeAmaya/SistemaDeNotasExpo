import React from "react";

const StudentCard = ({ student, deleteStudent, updateStudent }) => {
  
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
      deleteStudent(student._id);
    }
  };

  const handleEdit = () => {
    updateStudent(student);
  };

  // Función para obtener el nombre del proyecto
  const getProjectName = (project) => {
    if (!project) return null;
    return project.projectName || project.title || project.name || `Proyecto ${project.projectId || project._id}`;
  };

  // Función para obtener el nombre del nivel
  const getLevelName = (level) => {
    if (!level) return 'No asignado';
    return level.name || level.levelName || 'Nivel no definido';
  };

  // Función para obtener el nombre de la sección
  const getSectionName = (section) => {
    if (!section) return 'No asignada';
    return section.name || section.sectionName || 'Sección no definida';
  };

  // Función para obtener el nombre de la especialidad
  const getSpecialtyName = (specialty) => {
    if (!specialty) return null;
    return specialty.name || specialty.specialtyName || 'Especialidad no definida';
  };

  return (
    <div className="group max-w-sm mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-4 border-green-100 hover:border-green-300 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
      {/* Header del estudiante */}
      <div className="relative bg-gradient-to-r from-green-400 to-green-600 p-6">
        <div className="text-center">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-white font-black text-xl">
            {student.name} {student.lastName}
          </h2>
          <p className="text-white/90 font-medium">Código: {student.studentCode}</p>
        </div>
        
        {/* Badge de proyecto */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            student.projectId 
              ? 'bg-blue-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {student.projectId ? '📚 Con Proyecto' : '📋 Sin Proyecto'}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-6 bg-gradient-to-b from-white to-green-50">
        {/* Información académica */}
        <div className="space-y-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="text-green-600 text-sm font-bold mb-1">📚 Nivel</div>
            <div className="text-green-800 font-medium">
              {getLevelName(student.idLevel)}
            </div>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="text-blue-600 text-sm font-bold mb-1">📁 Sección</div>
            <div className="text-blue-800 font-medium">
              {getSectionName(student.idSection)}
            </div>
          </div>

          {student.idSpecialty && (
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="text-purple-600 text-sm font-bold mb-1">🏆 Especialidad</div>
              <div className="text-purple-800 font-medium">
                {getSpecialtyName(student.idSpecialty)}
              </div>
            </div>
          )}

          {student.projectId && (
            <div className="bg-yellow-100 p-3 rounded-lg">
              <div className="text-yellow-600 text-sm font-bold mb-1">🚀 Proyecto</div>
              <div className="text-yellow-800 font-medium">
                {getProjectName(student.projectId)}
              </div>
              {/* Mostrar también el ID del proyecto como información adicional */}
              {student.projectId.projectId && (
                <div className="text-yellow-600 text-xs mt-1">
                  ID: {student.projectId.projectId}
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600 text-sm font-bold mb-1">📅 Registrado</div>
            <div className="text-gray-800 font-medium">
              {new Date(student.createdAt).toLocaleDateString('es-ES')}
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
            className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-300 flex items-center justify-center space-x-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Elemento decorativo inferior */}
      <div className="h-2 bg-gradient-to-r from-green-600 via-green-400 to-green-600"></div>
    </div>
  );
};

export default StudentCard;
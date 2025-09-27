import React, { useState } from "react";
import StudentCard from "./StudentCard";

const ListStudents = ({ students, loading, deleteStudent, updateStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar estudiantes por búsqueda
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return student.name.toLowerCase().includes(searchLower) ||
           student.lastName.toLowerCase().includes(searchLower) ||
           student.studentCode.toString().includes(searchLower) ||
           (student.idLevel?.name && student.idLevel.name.toLowerCase().includes(searchLower)) ||
           (student.idSection?.name && student.idSection.name.toLowerCase().includes(searchLower)) ||
           (student.idSpecialty?.name && student.idSpecialty.name.toLowerCase().includes(searchLower));
  });

  const getStats = () => {
    const stats = {
      total: students.length,
      withProject: students.filter(s => s.projectId).length,
      withoutProject: students.filter(s => !s.projectId).length,
      withSpecialty: students.filter(s => s.idSpecialty).length
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-full shadow-lg">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-4xl font-black text-green-800 tracking-wide">
            Estudiantes del Centro
          </h1>
        </div>
        
        {/* Línea decorativa */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent to-green-600 rounded-full"></div>
          <div className="h-2 w-8 bg-gradient-to-r from-green-600 via-green-400 to-green-600 rounded-full shadow-md"></div>
          <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-xl border-2 border-green-300 text-center">
          <div className="text-2xl font-black text-green-800">{stats.total}</div>
          <div className="text-green-600 font-bold text-sm">Total Estudiantes</div>
        </div>
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300 text-center">
          <div className="text-2xl font-black text-blue-800">{stats.withProject}</div>
          <div className="text-blue-600 font-bold text-sm">Con Proyecto</div>
        </div>
        <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-xl border-2 border-orange-300 text-center">
          <div className="text-2xl font-black text-orange-800">{stats.withoutProject}</div>
          <div className="text-orange-600 font-bold text-sm">Sin Proyecto</div>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl border-2 border-purple-300 text-center">
          <div className="text-2xl font-black text-purple-800">{stats.withSpecialty}</div>
          <div className="text-purple-600 font-bold text-sm">Con Especialidad</div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-2xl border-2 border-green-100 shadow-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, código, nivel, sección o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
          />
          <span className="absolute left-4 top-3 text-green-400 text-xl">🔍</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center">
            <p className="text-green-700 font-bold text-lg">Cargando estudiantes...</p>
            <p className="text-green-500 text-sm">Por favor espera un momento</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!students || students.length === 0) && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-green-600">🎓</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-800">¡No hay estudiantes registrados!</h3>
            <p className="text-green-600 max-w-md mx-auto">
              Aún no se han registrado estudiantes en el sistema. 
              ¡Comienza agregando el primer estudiante!
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-16 space-y-6">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-6xl text-gray-500">🔍</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800">No se encontraron resultados</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No hay estudiantes que coincidan con tu búsqueda.
            </p>
          </div>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 && (
        <>
          {/* Contador de resultados */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 rounded-full border-2 border-green-300 shadow-lg">
              <span className="text-green-700 font-bold">Mostrando:</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full font-black text-sm shadow-inner">
                {filteredStudents.length}
              </span>
              <span className="text-green-700 font-bold">
                {filteredStudents.length === 1 ? 'Estudiante' : 'Estudiantes'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
            {filteredStudents.map((student, index) => (
              <div
                key={student._id}
                className="animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <StudentCard
                  student={student}
                  deleteStudent={deleteStudent}
                  updateStudent={updateStudent}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default ListStudents;
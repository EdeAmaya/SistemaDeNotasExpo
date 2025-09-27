import React from 'react';

const Evaluations = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header decorativo */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white py-8 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white text-purple-700 p-4 rounded-full shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-wide drop-shadow-lg">
                Sistema de Evaluaciones
              </h1>
              <p className="text-purple-200 text-lg font-medium mt-1">
                Evalúa y califica los proyectos técnicos científicos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-4">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-gray-600 text-center mb-8">Página de sistema de evaluaciones en construcción...</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <span className="text-3xl">📝</span>
              <h3 className="font-bold text-purple-800 mt-2">Evaluaciones</h3>
              <p className="text-purple-600 text-sm">Crear evaluaciones</p>
              <div className="text-xl font-bold text-purple-700 mt-2">15</div>
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <span className="text-3xl">⏰</span>
              <h3 className="font-bold text-red-800 mt-2">Pendientes</h3>
              <p className="text-red-600 text-sm">Por evaluar</p>
              <div className="text-xl font-bold text-red-700 mt-2">7</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <span className="text-3xl">✅</span>
              <h3 className="font-bold text-green-800 mt-2">Completadas</h3>
              <p className="text-green-600 text-sm">Evaluaciones finalizadas</p>
              <div className="text-xl font-bold text-green-700 mt-2">23</div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <span className="text-3xl">📈</span>
              <h3 className="font-bold text-blue-800 mt-2">Promedio</h3>
              <p className="text-blue-600 text-sm">Calificación general</p>
              <div className="text-xl font-bold text-blue-700 mt-2">8.5</div>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-purple-100 to-purple-200 p-6 rounded-xl">
            <h4 className="text-purple-800 font-bold text-lg mb-2">🎯 Criterios de Evaluación:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-purple-700 text-sm">
                <strong>• Innovación y Creatividad</strong><br />
                <span className="text-purple-600">Originalidad del proyecto</span>
              </div>
              <div className="text-purple-700 text-sm">
                <strong>• Metodología Científica</strong><br />
                <span className="text-purple-600">Rigor en el proceso</span>
              </div>
              <div className="text-purple-700 text-sm">
                <strong>• Impacto Social</strong><br />
                <span className="text-purple-600">Beneficio para la comunidad</span>
              </div>
              <div className="text-purple-700 text-sm">
                <strong>• Presentación</strong><br />
                <span className="text-purple-600">Comunicación efectiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluations;
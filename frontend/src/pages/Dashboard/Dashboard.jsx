import React from 'react';

const Dashboard = () => {
  const currentUser = "Eduardo";
  const currentProgress = 30;
  
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-ES', options);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const connectedUsers = [
    { name: "Juan Pérez", role: "Estudiante", status: "online" },
    { name: "Bryan Miranda", role: "Docente", status: "online" },
    { name: "Luis Amaya", role: "Docente", status: "online" },
    { name: "Carlos Rodríguez", role: "Evaluador", status: "online" }
  ];

  const actions = [
    {
      id: 1,
      title: "VER PROYECTOS",
      icon: "👁️",
      action: () => console.log("Navegar a /proyectos")
    },
    {
      id: 2,
      title: "CREAR EVALUACIÓN",
      icon: "⭐",
      action: () => console.log("Navegar a /evaluaciones")
    },
    {
      id: 3,
      title: "GENERAR REPORTE",
      icon: "🖨️",
      action: () => console.log("Generar reporte")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="px-8 py-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Welcome Section */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold text-white">
                {getCurrentGreeting()}, {currentUser}!
              </h1>
              <span className="text-3xl ml-2">☀️</span>
            </div>
            <p className="text-gray-300 text-base mb-1 capitalize">
              {getCurrentDate()}
            </p>
            <p className="text-white text-3xl font-light">
              {getCurrentTime()}
            </p>
          </div>

          {/* Settings Icon */}
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="text-2xl text-gray-400">⚙️</span>
          </button>
        </div>

        {/* Current Stage Section */}
        <div className="flex justify-end mb-8">
          <div className="text-right">
            <p className="text-gray-300 text-lg mb-2">Etapa Actual:</p>
            <div className="flex items-center gap-4">
              <span className="text-8xl font-bold text-red-600">{currentProgress}%</span>
              <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <span className="text-xl text-gray-300">⚙️</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description and Connected Users */}
        <div className="flex gap-8 mb-8">
          {/* Description */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-4">Descripción</h2>
            <div className="bg-gray-800 rounded-2xl p-6">
              <p className="text-white leading-6">
                El <span className="font-bold">Proyecto Técnico Científico</span> es un proceso de aprendizaje significativo que integra las competencias adquiridas durante el año lectivo para ser aplicadas en la{" "}
                <span className="font-bold">propuesta de solución a una necesidad del entorno social, industrial, económico o cultural.</span>
              </p>
              <button className="bg-white text-black px-6 py-2 rounded-full font-semibold mt-4 hover:bg-gray-200 transition-colors">
                LEER MÁS
              </button>
            </div>
          </div>

          {/* Connected Users */}
          <div className="w-80">
            <h2 className="text-lg font-bold text-white mb-4">Usuarios conectados</h2>
            <div className="bg-gray-800 rounded-2xl p-4">
              {connectedUsers.length > 0 ? (
                <div className="space-y-4">
                  {connectedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.role}</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">
                  No hay ningún usuario en línea.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Acciones</h2>
          <div className="flex gap-6 justify-center">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-gray-800 rounded-2xl p-8 flex-1 max-w-xs hover:bg-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <p className="text-white font-semibold text-sm">
                    {action.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
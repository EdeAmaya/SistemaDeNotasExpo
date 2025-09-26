import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  const currentUser = "Eduardo"; // Esto vendría de contexto/estado global
  const currentProgress = 30; // Progreso actual
  
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
      title: "VER NOTAS",
      icon: "eye-outline",
      action: () => console.log("Navegar a /notes")
    },
    {
      id: 2,
      title: "CREAR NOTA",
      icon: "add-circle-outline", 
      action: () => console.log("Navegar a /notes con modal crear")
    },
    {
      id: 3,
      title: "GENERAR REPORTE",
      icon: "document-text-outline",
      action: () => console.log("Generar reporte")
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-6 py-8">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-8">
          {/* Welcome Section */}
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-3xl font-bold text-gray-800">
                {getCurrentGreeting()}, {currentUser}!
              </Text>
              <Text className="text-3xl ml-2">☀️</Text>
            </View>
            <Text className="text-gray-600 text-base mb-1 capitalize">
              {getCurrentDate()}
            </Text>
            <Text className="text-gray-600 text-base">
              {getCurrentTime()}
            </Text>
          </View>

          {/* Settings Icon */}
          <TouchableOpacity className="p-2">
            <Ionicons name="settings-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Current Stage Section */}
        <View className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 text-base mb-2">Etapa Actual:</Text>
              <Text className="text-6xl font-bold text-red-600">{currentProgress}%</Text>
            </View>
            <TouchableOpacity className="p-3 bg-gray-100 rounded-full">
              <Ionicons name="settings-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description and Connected Users */}
        <View className="flex-row gap-6 mb-8">
          {/* Description */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-4">Descripción</Text>
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <Text className="text-gray-700 leading-6">
                El <Text className="font-bold">Sistema de Notas</Text> es una plataforma integral 
                que permite la gestión eficiente de notas académicas, facilitando el proceso de 
                <Text className="font-bold"> organización y seguimiento del progreso educativo.</Text>
              </Text>
            </View>
          </View>

          {/* Connected Users */}
          <View className="w-80">
            <Text className="text-lg font-bold text-gray-800 mb-4">Usuarios Conectados</Text>
            <View className="bg-white rounded-2xl p-4 shadow-lg">
              {connectedUsers.length > 0 ? (
                <View className="space-y-3">
                  {connectedUsers.map((user, index) => (
                    <View key={index} className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold text-gray-800">{user.name}</Text>
                        <Text className="text-sm text-gray-500">{user.role}</Text>
                      </View>
                      <View className="w-3 h-3 bg-green-500 rounded-full"></View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-500 text-center">
                  No hay ningún usuario en línea.
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Acciones</Text>
          <View className="flex-row gap-4 justify-center">
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.action}
                className="bg-white rounded-2xl p-6 shadow-lg flex-1 max-w-xs"
              >
                <View className="items-center space-y-3">
                  <View className="bg-gray-100 p-4 rounded-full">
                    <Ionicons name={action.icon} size={32} color="#374151" />
                  </View>
                  <Text className="text-gray-800 font-semibold text-center">
                    {action.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
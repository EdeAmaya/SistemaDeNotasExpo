import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Adaptado a tu lógica
// import { useNavigation } from '@react-navigation/native'; // Para React Native navigation

const NavBar = ({ currentRoute = 'Dashboard' }) => {
  const { logout, authCokie } = useAuth(); // Tu lógica de autenticación
  // const navigation = useNavigation(); // Para navegación
  const progress = 30; // Esto vendría del contexto global
  
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Inicio',
      icon: 'home-outline',
      iconActive: 'home',
      route: 'Dashboard'
    },
    {
      id: 'notes',
      title: 'Notas',
      icon: 'document-text-outline', 
      iconActive: 'document-text',
      route: 'Notes'
    },
    {
      id: 'categories',
      title: 'Categorías',
      icon: 'pricetag-outline',
      iconActive: 'pricetag', 
      route: 'Categories'
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: 'people-outline',
      iconActive: 'people',
      route: 'Users'
    },
    {
      id: 'activities',
      title: 'Actividades',
      icon: 'calendar-outline',
      iconActive: 'calendar',
      route: 'Activities'
    }
  ];

  const handleNavigation = (route) => {
    console.log(`Navegando a: ${route}`);
    // navigation.navigate(route); // Para React Native
    // O tu lógica de navegación personalizada
  };

  const handleLogout = () => {
    logout();
    console.log('Cerrando sesión...');
    // navigation.navigate('Login'); // Redirigir al login
  };

  // No mostrar navbar si no está autenticado
  if (!authCokie) return null;

  return (
    <View className="w-64 bg-gray-900 h-full">
      {/* Header con Logo */}
      <View className="pt-8 pb-6 px-6 border-b border-gray-800">
        <TouchableOpacity 
          onPress={() => handleNavigation('Dashboard')}
          className="items-center mb-4"
        >
          {/* Logo Circular */}
          <View className="w-16 h-16 bg-red-600 rounded-full items-center justify-center mb-3">
            <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
              <Text className="text-red-600 font-bold text-lg">📝</Text>
            </View>
          </View>
          
          {/* Nombre del Sistema */}
          <Text className="text-white text-center">
            <Text className="font-light">Sistema de</Text>
            {'\n'}
            <Text className="font-bold">Notas</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navegación */}
      <View className="flex-1 pt-6">
        {menuItems.map((item) => {
          const isActive = currentRoute === item.route;
          
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNavigation(item.route)}
              className={`flex-row items-center px-6 py-4 mx-3 rounded-lg mb-1 ${
                isActive ? 'bg-gray-800' : ''
              }`}
            >
              <Ionicons 
                name={isActive ? item.iconActive : item.icon} 
                size={20} 
                color={isActive ? '#F3F4F6' : '#9CA3AF'} 
              />
              <Text className={`ml-3 font-medium ${
                isActive ? 'text-gray-100' : 'text-gray-400'
              }`}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progreso */}
      <View className="px-6 py-4 border-t border-gray-800">
        <Text className="text-white font-semibold mb-3">Progreso Expo</Text>
        
        {/* Barra de Progreso */}
        <View className="bg-gray-700 rounded-full h-2 mb-2">
          <View 
            className="bg-red-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        
        {/* Porcentaje */}
        <Text className="text-red-500 font-bold text-lg text-center">
          {progress}%
        </Text>
      </View>

      {/* Botón Cerrar Sesión */}
      <View className="px-6 py-4 border-t border-gray-800">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-3"
        >
          <Ionicons 
            name="log-out-outline" 
            size={20} 
            color="#9CA3AF" 
          />
          <Text className="ml-3 text-gray-400 font-medium">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NavBar;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // Import bottom tab navigator
import HomePage from '../screens/HomePage';  // Import HomePage screen
import Basket from '../screens/Basket';  // Import Basket screen
import { Ionicons } from '@expo/vector-icons'; // For icons

const Tab = createBottomTabNavigator();  // Create bottom tab navigator

export default function TabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"  // Use the string "Home" for initialRouteName
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Basket') {
            iconName = 'cart';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,  // Disable header across all screens
      })}
    >
     <Tab.Screen
      name="Home"
      component={HomePage}
      options={{
        tabBarStyle: { display: 'flex' }, // This ensures the tab bar is always displayed
        tabBarVisible: true, // Ensure tab bar is visible when navigating back to HomePage
      }}
    />
      <Tab.Screen name="Basket" component={Basket} />
    </Tab.Navigator>
  );
}

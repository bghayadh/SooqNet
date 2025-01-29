import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // Import bottom tab navigator
import HomePage from '../screens/HomePage';  // Import HomePage screen
import Basket from '../screens/Basket';  // Import Basket screen
import LoginView from '../screens/Login/LoginView';  // Import LoginView screen
import MyAccount from '../screens/Login/MyAccount';  // Import MyAccount screen
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // For icons

const Tab = createBottomTabNavigator();  // Create bottom tab navigator

export default function TabNavigation() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoginDetails = await AsyncStorage.getItem('loginDetails');
        if (storedLoginDetails) {
          const userData = JSON.parse(storedLoginDetails);
          if (userData.isLoggedIn === "true") {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Error reading login data:", error);
      } 
    };
    checkLoginStatus();
  }, []);


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
         else if (route.name === 'MyAccount' || route.name === 'Login') {
            iconName = 'person';
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
      {isLoggedIn ? (
        <Tab.Screen name="MyAccount" component={MyAccount} />
      ) : (
        <Tab.Screen name="Login" component={LoginView} />
      )}
    </Tab.Navigator>
  );
}

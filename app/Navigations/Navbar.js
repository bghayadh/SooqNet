import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';  
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';  // Importing useTranslation hook

const Navbar = ({ activetab }) => { 
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedClientFullName, setLoggedClientFullName] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const { t, i18n } = useTranslation();
  const lang =i18next.language;
  const isRTL = lang === 'ar';
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoginDetails = await AsyncStorage.getItem('loginDetails');
      
        if (storedLoginDetails) {
          const userData = JSON.parse(storedLoginDetails);
          if (userData.isLoggedIn === "true") {
            setLoggedClientFullName(userData.clientName);
            setLoginIdentifier(userData.loginIdentifier);
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
<View style={[styles.navbar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>      
  {/* Home Button */}
      <TouchableOpacity 
        style={[styles.navItemContainer]} 
        onPress={() => router.push('/screens/HomePage')}
      >
        <Ionicons 
          name="home"  // Use home icon
          size={17}  // Adjust size
          color={activetab === 'home' ? 'black' : '#aaa'}  
        />
        <Text style={[styles.navItem, activetab === 'home' && styles.activeText]}>
       {t('home')}
        </Text>
      </TouchableOpacity>

      {/* Basket Button */}
      <TouchableOpacity 
        style={[styles.navItemContainer]}  
        onPress={() => router.push('/screens/Basket')}
      >
        <Ionicons 
          name="cart"  // Use shopping cart icon
          size={17}  // Adjust size
          color={activetab === 'basket' ? 'black' : '#aaa'}  
        />
        <Text style={[styles.navItem, activetab === 'basket' && styles.activeText]}> 
        {t('basket')}
        </Text>
      </TouchableOpacity>

       {/* Conditionally render Login or My Account */}
       {isLoggedIn ? (
        <TouchableOpacity 
          style={[styles.navItemContainer]}  
          onPress={() => router.push({   pathname: '/screens/Login/MyAccount',
            params: {
              loggedClientFullName:loggedClientFullName,loginIdentifier:loginIdentifier,
            },
           })        
        }

        
        >
          <Ionicons 
            name="person" 
            size={17}
            color={activetab === 'myaccount' ? 'black' : '#aaa'}
          />
          <Text style={[styles.navItem, activetab === 'myaccount' && styles.activeText]}>
            {t("myaccount")}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.navItemContainer]}  
          onPress={() => router.push('/screens/Login/LoginView')}
        >
          <Ionicons 
            name="person"
            size={17}
            color={activetab === 'login' ? 'black' : '#aaa'}
          />
          <Text style={[styles.navItem, activetab === 'login' && styles.activeText]}>
          {t('login')}
          </Text>
        </TouchableOpacity>
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 5,  
    paddingHorizontal: 20,  
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderColor: '#ddd',
    elevation: 10,  
  },
  navItemContainer: {
    alignItems: 'center',
    paddingVertical: 0,  
    paddingHorizontal: 5,  
  },
  navItem: {
    color: '#aaa',  
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
 
  activeText: {
    color: 'black',  
  },
});

export default Navbar;

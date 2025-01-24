import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';  

const Navbar = ({ activetab }) => { 
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      {/* Home Button */}
      <TouchableOpacity 
        style={[styles.navItemContainer, activetab === 'home']} 
        onPress={() => router.push('/screens/HomePage')}
      >
        <Ionicons 
          name="home"  // Use home icon
          size={17}  // Adjust size
          color={activetab === 'home' ? 'black' : '#aaa'}  
        />
        <Text style={[styles.navItem, activetab === 'home' && styles.activeText]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Basket Button */}
      <TouchableOpacity 
        style={[styles.navItemContainer, activetab === 'basket']}  
        onPress={() => router.push('/screens/Basket')}
      >
        <Ionicons 
          name="cart"  // Use shopping cart icon
          size={17}  // Adjust size
          color={activetab === 'basket' ? 'black' : '#aaa'}  
        />
        <Text style={[styles.navItem, activetab === 'basket' && styles.activeText]}> 
          Basket
        </Text>
      </TouchableOpacity>
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
  activeTab: {
    backgroundColor: '#f5f5f5', 
    borderRadius: 10,
  },
  activeText: {
    color: 'black',  
  },
});

export default Navbar;

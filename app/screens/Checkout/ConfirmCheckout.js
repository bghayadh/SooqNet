import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const ConfirmCheckout = () => {
  const router = useRouter(); 

  useEffect(() => {
    const backAction = () => {
      router.push('/screens/HomePage');
      return true; 
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [router]);

  useEffect(() => {
    const clearCartData = async () => {
      try {
        await AsyncStorage.removeItem('cartData');
        console.log('Cart data has been cleared.');
      } catch (error) {
        console.error('Error clearing cart data:', error);
      }
    };

    clearCartData(); 

  }, []); 

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Confirmation</Text>
      
      <Text style={styles.message}>
        We've received your order and will begin processing shortly.
      </Text>
      
      <Text style={styles.thankYou}>
        Thanks for shopping with us!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2a9d8f', 
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333', 
    marginBottom: 20,
    paddingHorizontal: 20, 
  },
  thankYou: {
    fontSize: 16,
    color: '#555', 
    fontStyle: 'italic',
    marginBottom: 30,
  },
});

export default ConfirmCheckout;

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const ConfirmCheckout = () => {
  const router = useRouter(); 
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar';

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
      <Text style={styles.header}>{t('orderConfirmation')}</Text>
      
      <Text style={styles.message}>
      {t('orderRecievedStat')}
      </Text>
      
      <Text style={styles.thankYou}>
      {t('thanksStat')}
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

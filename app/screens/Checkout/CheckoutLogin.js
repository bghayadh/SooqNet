import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipAddress, port, webAppPath } from '@env';


const CheckoutLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar'; 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('PleaseEmailandPasswordStat'));
      return;
    }
    try {
      const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/cltLoginAuthentication', {
        params: { loginIdentifier: email, password: password, }
      });

      if (response.data.Message === "Success") {
       
        await AsyncStorage.setItem('loginDetails', JSON.stringify({
          loginIdentifier: email,
          password:password,
          clientName: response.data.clientName,
          isLoggedIn:"true",
        }));

        router.push('/screens/Checkout/GuestPersonalInfo');
      } 
      else {
        Alert.alert("Login Failed", response.data.Message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleRegister = () => {
    router.push({ pathname: '/screens/Login/CreateAccount' })
  };

  const handleGuestLogin = () => {
    try{
    router.push('/screens/Checkout/GuestPersonalInfo');
  }
  catch{
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('signInStat')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('loginn')}</Text>
      </TouchableOpacity>

      <View style={[styles.registerContainer,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.registerText}>{t('noAccountStat')}</Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>{t('register')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
        <Text style={styles.guestButtonText}>{t('coninueasGuest')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'thin',
    marginBottom: 10,
    marginTop:40
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom:20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  registerText: {
    fontSize: 16,
    color: '#888',
  },
  registerLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  guestButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  guestButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutLogin;

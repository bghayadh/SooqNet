import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,BackHandler,Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {ipAddress,port,webAppPath,url} from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useKeyboardVisible } from '../../Components/KeyboardScreen';

const ChangePassword = () => {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  const {loginIdentifier,loggedClientFullName} = useLocalSearchParams();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { t, i18n } = useTranslation(); 
  const lang = i18next.language;
  const isRTL = lang === 'ar'; 

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert(t('pleaseFillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(t('newPasswordsDoNotMatchStat'));
      return;
    }
    try {
      const response = await axios.post(url+'/SooqNetChangeAccountPassword', new URLSearchParams({
        loginIdentifier, oldPassword, newPassword,
      }));
   
      if (response.data.Status === "Success") {      
        Alert.alert("Account Update", t('passwordChangedSuccessfullyStat'));
        await AsyncStorage.setItem('loginDetails', JSON.stringify({
          loginIdentifier: "",  
          clientName: "",       
          isLoggedIn: "false"    
        }));      
        router.push({
          pathname: '/screens/Login/LoginView',
        });
      } 
      else{
        Alert.alert("Password Update Failed", response.data.message || response.data.Message || t('somethingWentWrong'));
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", t('somethingWentWrong'));
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', t('wantToGoBackAndDiscardStat'), [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => router.push({ pathname: '/screens/Login/MyAccount',
          params: { loggedClientFullName:loggedClientFullName,loginIdentifier:loginIdentifier },
         })      
        },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.screen}>
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.container,
        {
          flexGrow: keyboardVisible ? 0 : 1,
          paddingBottom: keyboardVisible ? 24 : 72 + insets.bottom,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={60}
    >
      <Text style={styles.title}>{t('changePassword')}</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder={t('oldPassword')} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      </View>
      <View style={[styles.inputContainer,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TextInput style={styles.input} placeholder={t('newPassword')} secureTextEntry={!showNewPassword} value={newPassword} onChangeText={setNewPassword}  />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <View style={[styles.inputContainer,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TextInput style={styles.input} placeholder={t('confirmPassword')} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>{t('changePassword')}</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
    {!keyboardVisible && <Navbar activetab="" />}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePassword;

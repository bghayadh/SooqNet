import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,BackHandler,Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {ipAddress,port,webAppPath} from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import Navbar from '../../Navigations/Navbar';

const ChangePassword = () => {

  const {loginIdentifier,loggedClientFullName} = useLocalSearchParams();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all the fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    const response = await axios.post('http://'+ipAddress+':'+port+webAppPath+'/SooqNetChangeAccountPassword',{}, {
      params: {
        loginIdentifier:loginIdentifier,oldPassword:oldPassword,newPassword:newPassword
      }
    });
   
    if (response.data.Status === "Success") {      
      Alert.alert("Account Update", "Password changed successfully!");
      await AsyncStorage.setItem('loginDetails', JSON.stringify({
        loginIdentifier: "",  
        password: "",         
        clientName: "",       
        isLoggedIn: "false"    
      }));      
      router.push({
        pathname: '/screens/Login/LoginView',
      });
    } 
    else{
      Alert.alert("Password Update Failed", response.data.message);
    }
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to go back and discard ?', [
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
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Old Password" value={oldPassword} onChangeText={setOldPassword} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="New Password" secureTextEntry={!showNewPassword} value={newPassword} onChangeText={setNewPassword}  />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      <Navbar activetab="" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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

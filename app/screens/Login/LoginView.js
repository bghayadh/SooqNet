import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import axios from "axios";
import { ipAddress, port, webAppPath } from "@env";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../Navigations/Navbar';

const LoginScreen = () => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedLoginDetails = await AsyncStorage.getItem('loginDetails');
       
        if (storedLoginDetails) {
          const userData = JSON.parse(storedLoginDetails);
          if (userData.isLoggedIn === "true") {
            router.replace({
              pathname: '/screens/Login/MyAccount',
              params: { loggedClientFullName: userData.clientName,loginIdentifier:userData.loginIdentifier },
            });
          }
        }
      } catch (error) {
        console.error("Error reading login data:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);
  
  if (loading) {
    return <Text>Loading...</Text>; // Show a loading indicator while checking login status
  }

  const handleLogin = async () => {
    if (!loginIdentifier || !password) {
      Alert.alert("", "Please enter both email/username and password.");
      return;
    }
    try {
      const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/cltLoginAuthentication', {
        params: { loginIdentifier: loginIdentifier, password: password, }
      });

      if (response.data.Message === "Success") {
       
        await AsyncStorage.setItem('loginDetails', JSON.stringify({
          loginIdentifier: loginIdentifier,
          password:password,
          clientName: response.data.clientName,
          isLoggedIn:"true",
        }));

        router.push({
          pathname: '/screens/Login/MyAccount',
          params: {
            loggedClientFullName:response.data.clientName,loginIdentifier:loginIdentifier,
          },
        });
      } 
      else {
        Alert.alert("Login Failed", response.data.Message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Login</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Email / Username" placeholderTextColor="#ccc" value={loginIdentifier} onChangeText={setLoginIdentifier} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#ccc" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={handleLogin} />
      </View>

      <Text style={styles.footerText}>
        Don't have an account?{" "}
        <Text style={styles.link} onPress={() => router.push({ pathname: '/screens/Login/CreateAccount' })}>Sign up here</Text>
      </Text>
      <Navbar activetab="login" />
    </View>
    
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f0f4f8", 
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: 50,
    },
    titleText: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 10,
    },
    inputContainer: {
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: "#f9f9f9",
    },
    button: {
      backgroundColor: "#007bff",
      paddingVertical: 10,
      borderRadius: 5,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    footerText: {
      fontSize: 16,
      color: "#555",
      textAlign: "center",
      marginTop: 10,
    },
    link: {
      color: "#007bff",
      textDecorationLine: "underline",
      fontWeight: "bold",
    },
  });
  

export default LoginScreen;

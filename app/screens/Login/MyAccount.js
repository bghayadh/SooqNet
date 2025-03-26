import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const MyAccount = () => {
  const router = useRouter();
  const {loggedClientFullName,loginIdentifier } = useLocalSearchParams();
  const [loggedUser, setLoggedUser] = useState(loggedClientFullName || "");
  const { t, i18n } = useTranslation(); 
  const lang = i18next.language;
  const isRTL = lang === 'ar'; 

  const handleSignOut = async () => {
    try {

      await AsyncStorage.setItem('loginDetails', JSON.stringify({
        loginIdentifier: "",  
        password: "",         
        clientName: "",       
        isLoggedIn: "false"    
      }));      

      router.push({
        pathname: '/screens/Login/LoginView',
      });

      Alert.alert("Signed Out",t('signedOutStat'));
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", t('unableToSignOutStat'));
    }
  };

   
    return (
        <><ScrollView style={styles.loggedInContainer}>
        <View style={styles.greetingView}><Text style={styles.greeting}>{t('welcome')} {loggedUser.split(" ")[0]},</Text>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {loggedUser
                .split(" ")
                .map((name) => name.charAt(0).toUpperCase())
                .join("")}
            </Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {[
            {
              title: t('accountDetails'),
              icon: "person-circle-outline",
              onPress: () => router.push({
                pathname: '/screens/Login/EditAccountDetails',
                params: {
                  loginIdentifier: loginIdentifier,
                },
              })
            },
            {
              title: t('myOrders'),
              icon: "file-tray-full-outline",
              onPress: () => router.push({
                pathname: '/screens/Login/MyOrders',
                params: {
                  loginIdentifier: loginIdentifier,
                  loggedClientFullName: loggedUser,
                },
              })
            },
            {
              title: t('editAddress'),
              icon: "create-outline",
              onPress: () => router.push({
                pathname: '/screens/Login/EditAddress',
                params: {
                  loginIdentifier: loginIdentifier,
                  loggedClientFullName: loggedUser,
                },
              })
            },
            {
              title: t('paymentMethods'),
              icon: "card-outline"
            },
            {
              title: t('changePassword'),
              icon: "lock-closed-outline",
              onPress: () => router.push({
                pathname: '/screens/Login/ChangePassword',
                params: {
                  loginIdentifier: loginIdentifier,
                  loggedClientFullName: loggedUser,
                },
              })
            },
            {
              title: t('logout'),
              icon: "log-out-outline",
              onPress: () => handleSignOut()
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.option,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={item.onPress} 
            >
              <Ionicons name={item.icon} size={24} color="#555" style={styles.optionIcon} />
              <Text style={styles.optionText}>{item.title}</Text>
              <Ionicons  name={isRTL ? 'chevron-back-outline' : 'chevron-forward-outline'} size={24} color="#555" style={styles.optionArrow} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView><Navbar activetab="myaccount" /></>
      );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f0f4f8",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 50,
    },
    logoText: {
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
    loggedInContainer: {
      flex: 1,
      backgroundColor: "#fff",
      paddingHorizontal: 15,
    },
    greetingView: {
      marginTop: 30,
      alignItems: "center",
    },
    greeting: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#333",
    },
    optionsContainer: {
      marginTop:40,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      height:420,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      height:70,
    },
    optionIcon: {
      marginRight: 10,
    },
    optionText: {
      flex: 1,
      fontSize: 18,
      color: "#333",
    },
    optionArrow: {
      marginLeft: 10,
    },
    avatarContainer: {
        alignItems: "center", 
        marginTop:20,
      },
      avatar: {
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: "#000", 
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2, 
        borderColor: "#ccc", 
      },
      avatarText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
      },
      
  });
  

export default MyAccount;

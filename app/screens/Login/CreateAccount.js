import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView,Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { ipAddress, port, webAppPath } from "@env";
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const CreateAccount = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { t, i18n } = useTranslation(); 


const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const handleContinueAction = async () => {
    if (!email.trim()) {
      Alert.alert("Input Required", t('enterEmailToContinue'));
    } 
    else if (!validateEmail(email)) {
      Alert.alert("Invalid Email", t('pleaseEnterValidEmailAddress'));
    } 
    else {
      try {
        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/CheckEmailAvailability', {
          params: { email }
        });
        if (response.data.isAvailable === "false") { // An account is already created using this email
            router.push({
              pathname: '/screens/Login/CreateAccountWithEmail',
              params: {
                EmailAvailability:'false',
                email:email
              },
            });
        } 
        else {  // Email is available , proceed to create account using this email
          router.push({
            pathname: '/screens/Login/CreateAccountWithEmail',
            params: {
              EmailAvailability:'true',
              email:email
            },
          });
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        Alert.alert("Error", t('unableToCheckEmailValidation'));
      }
    }
  };

  return (
    <><ScrollView style={styles.container}>    
      <Text style={styles.title}>{t('createAccount')}</Text>      
      <View style={styles.privacyContainer}>
        <Ionicons name="lock-closed-outline" size={18} color="green" />
        <Text style={styles.privacyText}>{t('dataProtected')}</Text>
      </View>

      <View style={styles.subtitleView}>
        <View style={styles.subtitleBox}>
          <Text style={styles.subtitleBoxText}>{t('registerEnjoyTailoredExperience')}</Text>
        </View>
      </View>
     
      <TextInput style={styles.input} placeholder={t('emailPhoneNb')} keyboardType="email-address" onChangeText={setEmail} /> 
     
      <TouchableOpacity style={styles.socialButtonEmail} onPress={handleContinueAction} >
        <View style={styles.socialButtonContent}>
        <Ionicons name="mail-outline"  size={20}  style={styles.socialIcon} color="white" />
        <Text style={styles.emailSocialButtonText}>{t('continueWithEmail')}</Text>
        </View>
      </TouchableOpacity>
     
      <Text style={styles.orText}>or</Text>

      <TouchableOpacity style={styles.socialButton}>
        <View style={styles.socialButtonContent}>
          <Image source={require('../../Images/GoogleIcon.png')} style={styles.socialImageIcon} />
          <Text style={styles.socialButtonText}>{t('continueWithGoogle')}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <View style={styles.socialButtonContent}>
          <Ionicons name="logo-facebook" color="blue" size={20}  style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>{t('continueWithFacebook')}</Text>
        </View>
      </TouchableOpacity>  
      </ScrollView><Navbar activetab="" /></>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom:5,
  },
privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:50,
  },
  privacyText: {
    marginLeft: 8,
    color: 'green',
    textAlign: 'center',
  },
  subtitleView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  subtitleBox: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  subtitleBoxText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#aaa',
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonEmail: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor:'black',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialImageIcon:{
    width: 20,            
    height: 20,         
    marginRight: 5,
    borderRadius: 2,  
  },
  socialButtonText: {
    fontWeight: 'bold',
  },
  emailSocialButtonText: {
    fontWeight: 'bold',
    color:'white'
  },
});

export default CreateAccount;

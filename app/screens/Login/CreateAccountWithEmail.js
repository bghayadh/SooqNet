import React, { useState} from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {ipAddress,port,webAppPath} from "@env";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateAccount = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedGenderOption, setSelectedGenderOption] = useState("Select Gender");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const genderOptions = ["Male", "Female"];
  const {EmailAvailability,email } = useLocalSearchParams();
  const [emailAddress, setEmailAddress] = useState(email || "");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const router = useRouter();

  const handleRegister = async () => {
    if (!firstName || !lastName || !password || !email || !username || !mobileNumber) {
      alert("Please fill out all required fields.");
      return;
    }
    else{
      try {

        const response = await axios.post('http://'+ipAddress+':'+port+webAppPath+'/SaveSooqNetClientAccountDetails',{}, {
          params: {
            target:"NewClient",firstName:firstName, lastName:lastName,gender:selectedGenderOption,mobileNumber:mobileNumber,email:email,username:username,password:password
          }
        });

        if (response.data.Status === "Success") {
          await AsyncStorage.setItem('loginDetails', JSON.stringify({
            loginIdentifier: email,
            password:password,
            clientName: firstName+' '+lastName,
            isLoggedIn:"true",
          }));
  
          router.push({
            pathname: '/screens/Login/MyAccount',
            params: {
              loggedClientFullName:firstName+' '+lastName,
              loginIdentifier:email,
            },
          });
        } 
      } catch (error) {
        console.error("Error checking user status:", error);
        Alert.alert("Error", "Unable to check email validation.");
      }
    }
  };

  const handleLoginAction = async () => {
    if (!password) {
      Alert.alert("Input Required", "Enter your password");
    } 
    else {
      try {

        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/cltLoginAuthentication', {
          params: { loginIdentifier: emailAddress, password: password, }
        });

        if (response.data.Message === "Success") {
       
          await AsyncStorage.setItem('loginDetails', JSON.stringify({
            loginIdentifier: emailAddress,
            password:password,
            clientName: response.data.clientName,
            isLoggedIn:"true",
          }));
  
          router.push({
            pathname: '/screens/Login/MyAccount',
            params: {
              loggedClientFullName:response.data.clientName,
              loginIdentifier:emailAddress,
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
    }
  };

  const checkUsernameAvailability = async () => {
    if (!username.trim()) {
      setUsernameStatus(null);  // Clear status if input is empty
      return; // Do nothing if the input is empty
    }
  
    try {
      const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/CheckUsernameAvailability', {
        params: { username: username.trim() }
      });
  
      if (response.data.isAvailable ==="true") {
        setUsernameStatus({ available: true, message: "Username is available!" });
      } 
      else {
        setUsernameStatus({ available: false, message: "Username is already taken. Please choose another." });
      }
    } catch (error) {
      setUsernameStatus({ available: false, message: "Error checking username. Try again later." });
    }
  };
  
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const selectGenderOption = (option) => {
    setSelectedGenderOption(option);
    setDropdownVisible(false); // Close dropdown after selection
  };

  if (EmailAvailability === "false") {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Sign in</Text>
  
        <Text style={styles.message}>
        Looks like you already have an account using{" "}
        <Text style={{ fontWeight: "bold" }}>{emailAddress}</Text> , please enter your password.
      </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLoginAction}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Create Your Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Details</Text>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>First Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />
        </View>
        </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Last Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />
        </View>
        </View>


        <View style={styles.dropdownWrapper}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownButton}>
            <View style={styles.dropdownButtonContent}>
                <Text style={styles.dropdownButtonText}>{selectedGenderOption}</Text>
                <Ionicons name="caret-down-outline" size={14} color="black" />
            </View>
            </TouchableOpacity>

          {isDropdownVisible && (
            <View style={styles.dropdown}>
              {genderOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => selectGenderOption(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Mobile Number"
          />
        </View>
        </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={email}
            onChangeText={setEmailAddress}
            placeholder="Email"
          />
        </View>
        </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameStatus(null);  // Reset status when typing
            }}
            placeholder="Username"
            onEndEditing={checkUsernameAvailability}
          />
        </View>
        {usernameStatus && (
          <Text style={[styles.usernameStatus, usernameStatus.available ? styles.availableText : styles.unavailableText]}>
            {usernameStatus.message}
          </Text>
        )}
      </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            value={password}
            onChangeText={setPassword}
            placeholder="Password" secureTextEntry
          />
        </View>
        </View>

      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  section: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    fontSize: 16,
    height: 40,
    backgroundColor: "#fff",
  },
  dropdownWrapper: {
    marginBottom: 20,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    backgroundColor: "#fff",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#555",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginTop: 5,
  },
  dropdownOption: {
    padding: 10,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between", 
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#555",
    marginRight: 8, 
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: 10, 
  },
  inputWithIcon: {
    flex: 1, 
    fontSize: 16,
    paddingVertical: 8,
  },
  emailExistsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  emailMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  forgotPassword: {
    color: "#007bff",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3",
  },
  disabledButtonText: {
    color: "#aaa",
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  icon: {
    marginLeft: 10,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#007bff",
    textDecorationLine: "underline",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  usernameStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  availableText: {
    color: "green",
  },
  unavailableText: {
    color: "red",
  },
});

export default CreateAccount;

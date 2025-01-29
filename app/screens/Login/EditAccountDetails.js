import React, { useState,useEffect} from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView,Alert,BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {ipAddress,port,webAppPath} from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditAccountDetails = () => {
  const {loginIdentifier} = useLocalSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedGenderOption, setSelectedGenderOption] = useState("Select Gender");
  const [isDropdownVisible, setDropdownVisible] = useState(false); // For gender dropdown
  const genderOptions = ["Male", "Female"];
  const [email, setEmail] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);

  useEffect(() => {
    const GetClientDetails = async () => {
      try {
        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/GetSooqNetClientDetails', {
          params: { loginIdentifier: loginIdentifier}
        });

        if (response?.data?.clientDetailsList && response.data.clientDetailsList.length > 0) {
          const details = response.data.clientDetailsList[0]; 
          setFirstName(details[1] || "");  
          setLastName(details[2] || "");  
          setSelectedGenderOption(details[3] || "Select Gender"); 
          setMobileNumber(details[4] || "");  
          setEmail(details[5] || "");  
          setUsername(details[11] || ""); 
          
        }
      } catch (error) {
        console.error("There was an error!", error.message);
        setData([]);
      } finally {
      }
    };

    GetClientDetails();
  }, [loginIdentifier]);


  const saveChanges = async () => {
    if (!firstName || !lastName || !mobileNumber) {
      alert("Please fill out all required fields.");
      return;
    }
    else{
      try {

        const response = await axios.post('http://'+ipAddress+':'+port+webAppPath+'/SaveSooqNetClientAccountDetails',{}, {
          params: {
            target:"UpdateClient",firstName:firstName, lastName:lastName,gender:selectedGenderOption,mobileNumber:mobileNumber,email:email,username:username
          }
        });

        if (response.data.Status === "Success") {
          const storedLoginDetails = await AsyncStorage.getItem('loginDetails');          
          if (storedLoginDetails) {
            const userData = JSON.parse(storedLoginDetails);

            await AsyncStorage.setItem('loginDetails', JSON.stringify({//Update the asyncStorage with the updatedName
              loginIdentifier: userData.loginIdentifier,
              password:userData.password,
              clientName:firstName+' '+lastName,
              isLoggedIn:"true",
            }));
          }

          Alert.alert("Account Update", "Your account have been successfully updated.");

        } 
      } catch (error) {
        console.error("Error checking user status:", error);
        Alert.alert("Error", "Unable to check email validation.");
      }
    }
  };
  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const selectGenderOption = (option) => {
    setSelectedGenderOption(option);
    setDropdownVisible(false); // Close dropdown after selection
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>My details</Text>

      <View style={styles.section}>
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
          <TextInput style={styles.inputWithIcon} value={email} onChangeText={setEmail} placeholder="Email" editable={false}   />
        </View>
        </View>

        <View style={styles.inputWrapper}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#555" style={styles.inputIcon} />
          <TextInput style={styles.inputWithIcon} value={username} placeholder="Username" editable={false}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameStatus(null);  // Reset status when typing
            }}
            />
        </View>
        {usernameStatus && (
          <Text style={[styles.usernameStatus, usernameStatus.available ? styles.availableText : styles.unavailableText]}>
            {usernameStatus.message}
          </Text>
        )}
      </View>

      

      </View>

      
      <TouchableOpacity style={styles.button} onPress={saveChanges}>
        <Text style={styles.buttonText}>Save changes</Text>
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

export default EditAccountDetails;
import React, { useState,useEffect  } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { ipAddress, port, webAppPath } from '@env';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const GuestPersonalInfo = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 33.85929466,
    longitude: 35.54579928,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [loading, setLoading] = useState(true);  // Loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);

  const { t, i18n } = useTranslation();   
  const lang = i18next.language;
  const isRTL = lang === 'ar';
  const router = useRouter();
  locationPerm = 0;


  /* This code to handle the pressing for android hardware back button properly, actually we needed this code
  certainly because of the Arabic language, because the back button is not working fine in arabic language.

  The reason for using useCallback is to avoid executing the code when re-rending any component in the screen.
  */
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Go back if possible
        if (router.canGoBack()) {
          router.back();
          return true; // We handled it
        }
        return false; // Let OS handle (e.g., exit app)
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  /*check if the user ia logged in then get personal info of the user from data base else load 
  view with no data*/

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedLoginDetails = await AsyncStorage.getItem('loginDetails');
      if (storedLoginDetails) {
        const userData = JSON.parse(storedLoginDetails);
        if (userData.isLoggedIn === "true") {
          setIsLoggedIn(true);
          // Make axios request to fetch data
          try {
            const response = await axios.get('http://' + ipAddress + ':' + port + webAppPath + '/GetSooqNetClientDetails', {
           
              params: { loginIdentifier: userData.loginIdentifier }, 
            });
            if (response?.data?.clientDetailsList && response.data.clientDetailsList.length > 0) {
              const details = response.data.clientDetailsList[0]; 
              setFirstName(details[1] || "");  
              setLastName(details[2] || "");  
            
              setPhoneNumber(details[4] || "");  
              setEmail(details[5] || "");
              setLatitude (details[7] || "");
            
             setLongitude(details[6] || "");

             setIsEmailEditable(false);  // Set to false to make it readonly
            // console.log("country "+details[6] )
             setCountry(details[13] || "");
             setCity(details[14] || "");
             setAddress(details[8] || "");
             setLongitude(details[6] || "");
             setLatitude(details[7] || "");
              
            }
          } catch (error) {
            console.error("Error fetching user data", error);
            Alert.alert("Error", "Failed to load user data");
          }
        }
      }
      setLoading(false);  // Set loading to false once the data is fetched or if not logged in
    };

    checkLoginStatus();
  }, []);

  const setToCurrentLocation = async() => {
    setIsWaiting(true);
    try {
      if (locationPerm == 0) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", t('allowLocationAccessToUseThisFeatureStat'));
          setIsWaiting(false);
          return;
        }
      }
      locationPerm = 1;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

/*      setLatitude(latitude.toString());
      setLongitude(longitude.toString()); */

      setLatitude(latitude.toFixed(7).toString());
      setLongitude(longitude.toFixed(7).toString());  

      setRegion({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setMarker({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });      
    }
    catch {
      console.error("Error fetching location:", error);
      Alert.alert("Error", t('UnableToFetchLocationStat'));
      setIsWaiting(false);
    }
    finally {
      setIsWaiting(false);
    }
  };

  const handleMapSelect = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude.toFixed(7).toString());
    setLongitude(longitude.toFixed(7).toString());
  };

  const handleContinue = () => {
    if (!firstName || !lastName || !phoneNumber || !email || !city || !country || !address || !latitude || !longitude) {
      Alert.alert('Error', t('pleaseFillAllFields'));
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error',  t('pleaseEnterValidEmailAddress'));
      return;
    }

    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error',  t('pleaseEnterValidPhoneNumber'));
      return;
    }

    const latRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)/;
    const lonRegex = /^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/;

    if (!latRegex.test(latitude)) {
      Alert.alert('Error',  t('pleaseEnterValidLatitude'));
      return;
    }

    if (!lonRegex.test(longitude)) {
      Alert.alert('Error',  t('pleaseEnterValidLongitude'));
      return;
    }

    const formData = {
      firstName,
      lastName,
      phoneNumber,
      email,
      city,
      country,
      address,
      latitude,
      longitude,
    };

    // Pass form data to the next page (GuestPaymentandOrder)
    router.push({
      pathname: '/screens/Checkout/GuestPaymentandOrder', 
      params: { formData: JSON.stringify(formData) },
    });

  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {loading ? (
      <View style={styles.loadingContainer}>
        <Text>{t('loadingText')}</Text> 
      
      </View>
    ) : (
      <>
      <Text style={styles.title}>{t('personalInfo')}</Text>

      <View style={styles.formWrapper}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('firstName')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('firstName')}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('lastnNme')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('lastnNme')}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('phoneNumber')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('phoneNumber')}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('email')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={isEmailEditable}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('country')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('country')}
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('city')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('city')}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('address')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('address')}
              value={address}
              onChangeText={setAddress}
            />
          </View>
          {isWaiting && (          
            <ActivityIndicator size="large" color="#007bff" />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('latitude')}</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="location-on" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('latitude')}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('longitude')}</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="location-on" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('longitude')}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={setToCurrentLocation}>
        <Text style={styles.buttonText}>{t('getCurrentLoc')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.mapButton} onPress={() => setIsMapVisible(true)}>
        <Text style={styles.buttonText}>{t('selectFromMap')}</Text>
      </TouchableOpacity>

      {isMapVisible && (
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapSelect}
          showsUserLocation={true}
        >
          <Marker coordinate={{ latitude: parseFloat(latitude) || region.latitude, longitude: parseFloat(longitude) || region.longitude }} />
        </MapView>
      )}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>{t('continue')}</Text>
      </TouchableOpacity>
      </>
    )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer:{
    flex: 1,
    paddingTop: 0,

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formWrapper: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    width: '85%',
    height: 50,
    backgroundColor: '#fff',
    fontSize: 16,
    borderWidth: 0,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  mapButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
});

export default GuestPersonalInfo;

import React, { useState,useEffect  } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView,BackHandler,Alert,ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps"; 
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {ipAddress,port,webAppPath} from "@env";
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const EditAddress = () => {
  const {loginIdentifier,loggedClientFullName} = useLocalSearchParams();
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const router = useRouter();
  const [loading, setLoading] = useState(true);  
  const [currentLatitude, setCurrentLatitude] = useState("0");
  const [currentLongitude, setCurrentLongitude] = useState("0");
  const [region, setRegion] = useState({
    latitude: 33.8938,
    longitude: 35.495480,
    latitudeDelta: 0.01, // Smaller delta for zoomed-in view
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState(region);

   const { t, i18n } = useTranslation(); 
    const lang = i18next.language;
    const isRTL = lang === 'ar'; 

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get('http://' + ipAddress + ':' + port + webAppPath + '/GetSooqNetClientDetails', {
          params: { loginIdentifier: loginIdentifier }
        });
  
        if (response?.data?.clientDetailsList && response.data.clientDetailsList.length > 0) {
          const details = response.data.clientDetailsList[0];
          await getCurrentLocation(details);
          
          setAddress(details[8] || "");
        } 
        else {
          console.error("Failed to fetch address data");
          Alert.alert("Error", t('unableToFetchAddressDataStat'));
        }
      } catch (error) {
        console.error("Error fetching address data:", error);
        Alert.alert("Error", t('fetchingAddressDataErrorStat'));
      } finally {
        setLoading(false);
      }
    };
    fetchAddressData();
  }, []);


  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', t('goingBackStat'), [
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

  const handleMapPress = (latitude, longitude) => {
    setMarker({ latitude, longitude });
    setRegion({ latitude, longitude });
   
    setLatitude(latitude.toFixed(7).toString());
    setLongitude(longitude.toFixed(7).toString());
  };

  const setToCurrentLocation = () => {
    const latitude = parseFloat(currentLatitude);
    const longitude = parseFloat(currentLongitude);
  
    setLatitude(latitude.toFixed(7).toString());
    setLongitude(longitude.toFixed(7).toString());
    setMarker({ latitude, longitude });
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01, // Adjust for desired zoom level
      longitudeDelta: 0.01,
    });
   
  };
  
   // Function to get the current location
   const getCurrentLocation = async (details) => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", t('allowLocationAccessToUseThisFeatureStat'));
        setLoading(false);
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
      
      if (details[6] === "0" || details[7] === "0") {
        // If longitude or latitude are "0", set from current location
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());

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
      else {
        setLatitude(details[7]);
        setLongitude(details[6]);

        setRegion({
          latitude: parseFloat(details[7]),
          longitude: parseFloat(details[6]),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setMarker({
          latitude: parseFloat(details[7]),
          longitude: parseFloat(details[6]),
        });
      }

      // Store the latest current location for reuse
      setCurrentLatitude(latitude.toString());
      setCurrentLongitude(longitude.toString());
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", t('UnableToFetchLocationStat'));
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryAddress = async () => {
    if (!address) {
      alert(t('fillTheAddressStat'));
      return;
    }
    const response = await axios.post('http://'+ipAddress+':'+port+webAppPath+'/SaveSooqNetClientAccountDetails',{}, {
      params: {
        target:"UpdateAddress",loginIdentifier:loginIdentifier,address:address,longitude:longitude,latitude:latitude
      }
    });
    if (response.data.Status === "Success") {      
        setLatitude(latitude);
        setLongitude(longitude);

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

      Alert.alert("Account Update", t('addressUpdatedSuccessfullyStat'));
    } 
  };

  return (
    <>
    <ScrollView style={styles.container}   contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text>{t('fetchingLocation')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.header}>{t('editAddress')}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{t('deliveryLocation')}</Text>
            <TouchableOpacity style={styles.setCoordinatesButton} onPress={setToCurrentLocation}>
              <Text style={styles.buttonText}>{t('setCurrentLocation')}</Text>
            </TouchableOpacity> 
            <Text></Text>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('longitude')}</Text>
                <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('latitude')}</Text>
                <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>{t('address')}</Text>
              <View style={[styles.inputContainer,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="location-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput style={[styles.inputWithIcon, { height: 80 }]} value={address} onChangeText={setAddress} placeholder={t('address')} multiline />
                </View>
            </View>

            <MapView 
              style={styles.map} 
              region={region}
              onPress={(event) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                handleMapPress(latitude, longitude);
              }}
            >
              {marker && (
                <Marker
                  coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                  title="Selected Location"
                />
              )}
            </MapView>
          </View>
          <TouchableOpacity style={styles.updateAddressButton} onPress={updateDeliveryAddress}>
            <Text style={styles.buttonText}>{t('updateAddress')}</Text>
          </TouchableOpacity>
        </>
      )}
      </ScrollView><Navbar activetab="" /></>
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
    padding:5,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize:18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    marginTop:10,
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
    height: 300,
    borderRadius: 10,
    marginTop: 10,
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
    marginRight: 10, // Adds space between the icon and the text input
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  setCoordinatesButton: {
    backgroundColor: "#198754",
    padding: 10,
    alignItems: "center",
    marginHorizontal: 15,
  },
  updateAddressButton : {
    backgroundColor: "#0d6efd",
    padding: 10,
    alignItems: "center",
    marginHorizontal: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditAddress;

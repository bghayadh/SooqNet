import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const GuestPersonalInfo = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 33.85929466,
    longitude: 35.54579928,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });


  const { t, i18n } = useTranslation(); 
  
    const lang = i18next.language;
    const isRTL = lang === 'ar'; 

  const router = useRouter(); 

  const setToCurrentLocation = () => {
    const latitude = parseFloat(0.00);
    const longitude = parseFloat(0.00);

    setLatitude(latitude.toFixed(7).toString());
    setLongitude(longitude.toFixed(7).toString());
  };

  const handleMapSelect = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude.toFixed(7).toString());
    setLongitude(longitude.toFixed(7).toString());
  };

  const handleContinue = () => {
    if (!firstName || !lastName || !phoneNumber || !email || !city || !street || !building || !latitude || !longitude) {
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
      street,
      building,
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
          <Text style={styles.label}>{t('street')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('street')}
              value={street}
              onChangeText={setStreet}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('building')}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color="#333" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={t('building')}
              value={building}
              onChangeText={setBuilding}
            />
          </View>
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

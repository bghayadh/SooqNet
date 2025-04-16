import React, { useState, useEffect } from 'react';
import {
  VirtualizedList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Garbage icon
import Navbar from '../Navigations/Navbar';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ipAddress, port, webAppPath } from '@env';

const Basket = () => {
  const [basketData, setBasketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar'; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedCartData = await AsyncStorage.getItem('cartData');
        if (storedCartData) {
          setBasketData(JSON.parse(storedCartData));
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to update the quantity of an item
  const updateQuantity = async (ID, increment) => {
    try {
      const storedCartData = await AsyncStorage.getItem('cartData');
      let cartArray = storedCartData ? JSON.parse(storedCartData) : [];

      // Find the item in the cart
      const itemIndex = cartArray.findIndex((item) => item.ID === ID);

      if (itemIndex !== -1) {
        // Update the quantity
        const newQuantity = cartArray[itemIndex].quentity + increment;
        cartArray[itemIndex].quentity = newQuantity > 0 ? newQuantity : 1; // Avoid negative quantities
      }

      // Save the updated cart data to AsyncStorage
      await AsyncStorage.setItem('cartData', JSON.stringify(cartArray));

      // Update the state to re-render the component
      setBasketData(cartArray);
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  };

  const updateQuantityInput = async (ID, value) => {
    try {
      const newQuantity = Math.max(0, parseInt(value) || 0); // Ensure quantity is at least 1
      const storedCartData = await AsyncStorage.getItem('cartData');
      let cartArray = storedCartData ? JSON.parse(storedCartData) : [];

      // Find the item in the cart
      const itemIndex = cartArray.findIndex((item) => item.ID === ID);

      if (itemIndex !== -1) {
        // Update the quantity
        cartArray[itemIndex].quentity = newQuantity;
      }

      // Save the updated cart data to AsyncStorage
      await AsyncStorage.setItem('cartData', JSON.stringify(cartArray));

      // Update the state to re-render the component
      setBasketData(cartArray);
    } catch (error) {
      console.error("Error updating quantity input: ", error);
    }
  };

  const handleBlur = async (ID, value) => {
    try {

      if (value === "" || value ==0) {
        value = 1;
      }
      updateQuantityInput(ID, value);
    } catch (error) {
      console.error("Error handling blur: ", error);
    }
  };

  // Function to remove an item from the cart
  const removeCartItem = async (ID) => {
    try {
      const storedCartData = await AsyncStorage.getItem('cartData');

      if (!storedCartData) {
        return;
      }

      let cartArray = JSON.parse(storedCartData);

      cartArray = cartArray.filter(item => item.ID !== ID);

      await AsyncStorage.setItem('cartData', JSON.stringify(cartArray));

      setBasketData(cartArray);

    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleCheckoutPress = async () => {
    if (basketData.length > 0) {

      const storedLoginDetails = await AsyncStorage.getItem('loginDetails');

      try {
        const response = await axios.post('http://' + ipAddress + ':' + port + webAppPath + '/GetAllItemAvailableQtySooqNet', {
          dictParameter: basketData
        });

        const qtyItemList = response.data?.qtyItemList;

        let Flag=""; 
        for (let i = 0; i < basketData.length; i++) {
          const basketItem = basketData[i];
        
          // Find the matching entry in qtyItemList by itemCode
          const matchedRow = qtyItemList.find(row => row[1] === basketItem.itemCode);
        
          if (matchedRow) {
        
            if (parseInt(basketItem.quentity) > parseInt(matchedRow[0])) {
              if (isRTL) {
                alert(matchedRow[3] + t("itemOutOfStock"));
              } else {
                alert(matchedRow[2] + t("itemOutOfStock"));
              }
              Flag = "cantProceed";
              break;
            }
          }
        }
        
          
          if(Flag!="cantProceed"){
          if (storedLoginDetails) {
            const userData = JSON.parse(storedLoginDetails);
            if (userData.isLoggedIn === "true") {
            // console.log("login identifier "+userData.loginIdentifier)
              router.push('/screens/Checkout/GuestPersonalInfo');
            }
            else{
               router.push('/screens/Checkout/CheckoutLogin');
            }
          }
        }

      } catch (error) {
        console.error("Error fetching available quantity: ", error);
        alert(t('qtyCheckError')); 
        return;
      }

    } else {
      // Show an alert if the basket is empty
      alert('Your basket is empty. Add some items before proceeding to checkout.');
    }
  };


  const renderItem = ({ item }) => {
    const imagePath = item.imagePath + item.imageName;
  
    const discount = item.discount || 0;
    const discountAmount = (item.rate * discount) / 100; 
    const finalPrice = item.rate - discountAmount;
  
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.itemRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Image
            source={{ uri: imagePath }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{isRTL ? item.arabicItemName : item.itemName}</Text>
  
            <View style={[styles.colorSizeRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text>{isRTL ? item.arabicColorName : item.colorName}</Text>
              {item.itemSize ? <Text>/</Text> : null}
              <Text>{item.itemSize}</Text>
            </View>
  
            <View style={[styles.priceRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {discount > 0 ? (
                <>
                  <Text style={[styles.originalPrice,{textDecorationLine: 'line-through'}]}> {isRTL ? `${item.rate} $`:`$${item.rate}`}</Text>
                  <Text style={styles.discount}>-{isRTL ? `${discount} $` : `-${discount} $`}</Text>
                  <Text style={styles.finalPrice}>{isRTL ? `${finalPrice} $` : `$${finalPrice}`}</Text>
                </>
              ) : (
                <Text style={styles.originalPrice}>{isRTL ? `${item.rate} $`:`$${item.rate}`}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityMinusButton,{
                [isRTL ? 'borderLeftWidth' : 'borderRightWidth']: 1, 
                borderColor: '#ddd',  
              }]}
              onPress={() => updateQuantity(item.ID, -1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
  
            <TextInput
              style={styles.quantityTextInput}
              value={String(item.quentity)}
              keyboardType="numeric"
              onChangeText={(text) => updateQuantityInput(item.ID, text)}
              onBlur={(e) => handleBlur(item.ID, item.quentity)}
            />
  
            <TouchableOpacity
              style={[styles.quantityPlusButton, {
                [isRTL ? 'borderRightWidth' : 'borderLeftWidth']: 1, 
                borderColor: '#ddd',  
              }]}
              onPress={() => updateQuantity(item.ID, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => removeCartItem(item.ID)}
          >
            <Icon name="delete" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getItemCount = () => {
    return basketData.length;
  };

  const getItem = (data, index) => {
    return data[index];
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={[styles.header,{flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
          <Icon name="shopping-cart" size={24} color="#000" style={styles.icon} />
          <Text style={styles.headerTitle}>{t('basket')}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckoutPress}
          >
            <Text style={styles.checkoutButtonText}>{t('checkout')}</Text>
          </TouchableOpacity>
      </View>

      <VirtualizedList
       style={styles.virtualizedList} 
        data={basketData}
        initialNumToRender={10}
        renderItem={renderItem}
        keyExtractor={(item) => item.ID.toString()}
        getItemCount={getItemCount}
        getItem={getItem}
      />

      <Navbar activetab="basket" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'column',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginLeft: 10, 
    marginRight: 10, 
    borderRadius: 5,
    resizeMode: "contain",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#000',
    marginLeft: 5, 
    marginRight: 5, 
  },
  discount: {
    fontSize: 14,
    color: 'red',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 5,
    padding: 5,
    marginLeft: 5, 
    marginRight: 5, 
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 14,
    color: 'gray',
  },
  removeIcon: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSizeRow: {
    //flexDirection: 'row',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, 
    marginLeft: 10, 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  quantityMinusButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
   // borderRightWidth: 1, 
    //borderRightColor: '#ddd',
  },
  quantityPlusButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
   // borderLeftWidth: 1, 
    //borderLeftColor: '#ddd',
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityTextInput: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  virtualizedList: {
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  icon: {
    marginLeft: 10,
    marginRight: 10, 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  checkoutButton: {
    padding: 5,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default Basket;

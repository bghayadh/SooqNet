import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import {ipAddress,port,webAppPath} from "@env";
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router'; 
import { useRouter } from 'expo-router';

const GuestPaymentandOrder = () => {
  const [basketData, setBasketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null); 
  const router = useRouter();

  const { formData } = useLocalSearchParams(); 
  const parsedFormData = formData ? JSON.parse(formData) : null;

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

  // Calculate total before discount, total discount, and final amount after discount + shipping fee
  const calculateTotals = () => {
    let totalBeforeDiscount = 0;
    let totalDiscount = 0;
    let totalAfterDiscount = 0;
    let totalQty=0;

    basketData.forEach(item => {
      const discountPrice = item.discount
        ? item.rate - (item.rate * item.discount) / 100
        : item.rate;

      totalBeforeDiscount += item.rate * item.quentity;
      totalDiscount += (item.rate * item.discount * item.quentity) / 100;
      totalAfterDiscount += discountPrice * item.quentity;
      totalQty +=item.quentity;

    });

    const shippingFee = 5; // Fixed shipping fee
    const totalNetAmount = totalAfterDiscount + shippingFee;

    return {
      totalBeforeDiscount,
      totalDiscount,
      totalAfterDiscount,
      shippingFee,
      totalNetAmount,
      totalQty,
    };
  };

  const {
    totalBeforeDiscount,
    totalDiscount,
    totalAfterDiscount,
    shippingFee,
    totalNetAmount,
    totalQty,
  } = calculateTotals();

  const renderItem = ({ item }) => {
    const imagePath = item.imagePath + item.imageName;
    const discountPrice = item.discount
      ? item.rate - (item.rate * item.discount) / 100
      : item.rate;

    return (
      <View style={styles.itemRow}>
        <Image source={{ uri: imagePath }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>${discountPrice.toFixed(2)}</Text>
            {item.discount && (
              <Text style={styles.itemDiscount}> ({item.discount}% off)</Text>
            )}
          </View>
          <Text style={styles.itemQuantity}>Quantity: {item.quentity}</Text>
        </View>
      </View>
    );
  };

  const handlePaymentMethodChange = (method) => {
    if (paymentMethod === method) {
      setPaymentMethod(null);
    } else {
      setPaymentMethod(method);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method to place the order.');
    } else {
      try {
        console.log("totalQty "+totalQty)
        const response = await axios.post('http://' + ipAddress + ':' + port + webAppPath + '/placeOrder', {
          "dictParameter": basketData, 
          "paymentMethod": paymentMethod,
          "customerName": parsedFormData.firstName +' '+ parsedFormData.lastName,
          "address": parsedFormData.city +', '+ parsedFormData.street +', '+ parsedFormData.building,
          "phoneNumber": parsedFormData.phoneNumber,
          "email": parsedFormData.email,
          "long": parsedFormData.longitude,
          "lat": parsedFormData.latitude,
          "clientName": "Guest",
          "netTotal": totalNetAmount,
          "totalQty": totalQty,
          "totalAmount": totalNetAmount,
        });

        if (response.status === 200) {
          router.push('/screens/Checkout/ConfirmCheckout');
        } else {
          Alert.alert('Error', 'Something went wrong while placing the order.');
        }

        console.log("Payment Method: " + paymentMethod);
        console.log(response.data);  
      } catch (error) {
        console.error("Error placing order:", error.message);
        Alert.alert('Error', 'There was an error placing your order. Please try again.');
      }
    }
};

  

  if (loading) {
    return <Text>Loading...</Text>; 
  }

  return (
    <View style={styles.container}>
      <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentMethodTitle}>Select Payment Method:</Text>

        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            paymentMethod === 'Cash On Delivery' && styles.selectedCheckbox,
          ]}
          onPress={() => handlePaymentMethodChange('Cash On Delivery')}
        >
          <View
            style={[
              styles.checkbox,
              paymentMethod === 'Cash On Delivery' && styles.checkedCheckbox,
            ]}
          >
            {paymentMethod === 'Cash On Delivery' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            paymentMethod === 'creditCard' && styles.selectedCheckbox,
          ]}
          onPress={() => handlePaymentMethodChange('creditCard')}
          disabled
        >
          <View
            style={[
              styles.checkbox,
              paymentMethod === 'creditCard' && styles.checkedCheckbox,
            ]}
          >
            {paymentMethod === 'creditCard' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.paymentMethodText, styles.disabledText]}>Credit Card</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lineDivider}></View>

      <View style={styles.orderItemsContainer}>
        <Text style={styles.orderItemsTitle}>
          Order Items ({basketData.length})
        </Text>
        <FlatList
          data={basketData}
          renderItem={renderItem}
          keyExtractor={(item) => item.ID.toString()}
          horizontal // Display items in a horizontal row
          showsHorizontalScrollIndicator={false} // Hide the horizontal scroll bar
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total:</Text>
          <Text style={styles.summaryValue}>${totalBeforeDiscount.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Discount:</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>-${totalDiscount.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Shipping Fee:</Text>
          <Text style={styles.summaryValue}>${shippingFee.toFixed(2)}</Text>
        </View>

        <View style={styles.lineDivider}></View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Net Amount:</Text>
          <Text style={styles.summaryValue}>${totalNetAmount.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  paymentMethodContainer: {
    marginVertical: 20,
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: '#fff',
  },
  selectedCheckbox: {
    backgroundColor: '#f0f0f0',
  },
  checkmark: {
    fontSize: 13,
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  orderItemsContainer: {
    marginVertical: 20,
  },
  orderItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'column',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  itemInfo: {
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDiscount: {
    fontSize: 14,
    color: 'red',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
  },
  summaryContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountValue: {
    color: 'red',
  },
  lineDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default GuestPaymentandOrder;

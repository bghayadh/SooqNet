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

const Basket = () => {
  const [basketData, setBasketData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      console.log("value "+value)
      console.log("id "+ID)

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

  const renderItem = ({ item }) => {
    const imagePath = item.imagePath + item.imageName;

    const discount = item.discount || 0;
    const finalPrice = item.rate - discount;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemRow}>
          <Image
            source={{ uri: imagePath }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.itemName}</Text>

            <View style={styles.colorSizeRow}>
              <Text>{item.colorName}</Text>
              <Text>/</Text>
              <Text>{item.itemSize}</Text>
            </View>

            <View style={styles.priceRow}>
              {discount > 0 ? (
                <>
                  <Text style={styles.originalPrice}>${item.rate}</Text>
                  <Text style={styles.discount}>-${discount}</Text>
                  <Text style={styles.finalPrice}>${finalPrice}</Text>
                </>
              ) : (
                <Text style={styles.originalPrice}>${item.rate}</Text>
              )}
            </View>

          </View>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityMinusButton}
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
              style={styles.quantityPlusButton}
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
      <VirtualizedList
        data={basketData}
        initialNumToRender={10}
        renderItem={renderItem}
        keyExtractor={(item) => item.ID.toString()}
        getItemCount={getItemCount}
        getItem={getItem}
      />
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
    marginRight: 5,
  },
  discount: {
    fontSize: 14,
    color: 'red',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 5,
    padding: 5,
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
  // Updated colorSizeRow to allow wrapping
  colorSizeRow: {
    flexDirection: 'row',
    marginVertical: 5,
    flexWrap: 'wrap', // This allows wrapping to the next line
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  quantityPlusButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
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
});


export default Basket;

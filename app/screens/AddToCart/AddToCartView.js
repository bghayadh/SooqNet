import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import ItemImages from './ItemImages';
import ItemDetailsComponent from './ItemDetailsComponent';
import { useLocalSearchParams } from 'expo-router';
import { ipAddress, port, webAppPath } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';  // Importing useTranslation hook

const onAddCartPress = async (itemCode, itemData, colorID, colorName, itemSize, imagePath, imageName,t,arabicColorName) => {
  // Validate itemSize to make sure it's not null or empty
  if (!itemSize || itemSize === "") {
    // Display an alert or message
    const msg =t('addToCartAlert');
    alert(msg);
    return; // Stop further execution
  }

  // Generate unique ID for the item based on itemCode, colorID, and itemSize
  const ID = itemCode + "_" + colorID + "_" + itemSize;
  const quentity = 1; // Initial quantity for a new item
  const itemName = itemData[0][1];
  const arabicItemName = itemData[0][6];
  const rate = itemData[0][2];
  const discount = itemData[0][3];

  // Create the cart item object
  const cartItem = {
    ID,
    itemCode,
    colorID,
    colorName,
    itemSize,
    imagePath,
    imageName,
    itemName,
    rate,
    discount,
    quentity,
    arabicColorName,
    arabicItemName,
  };

  try {
    // Get the existing cart data from AsyncStorage
    const existingCartData = await AsyncStorage.getItem('cartData');
    
    // Initialize cartArray as an empty array if no data exists
    let cartArray = existingCartData ? JSON.parse(existingCartData) : [];

    // Make sure cartArray is an array
    if (!Array.isArray(cartArray)) {
      cartArray = [];
    }

    // Check if the item already exists in the cart based on the ID
    const existingItemIndex = cartArray.findIndex(item => item.ID === ID);

    if (existingItemIndex !== -1) {
      // Item already exists in the cart, so increment its quantity
      cartArray[existingItemIndex].quentity += 1;
    } else {
      // Item does not exist, so add it to the cart with quantity 1
      cartArray.push(cartItem);
    }

    // Save the updated cartArray back to AsyncStorage
    await AsyncStorage.setItem('cartData', JSON.stringify(cartArray));

    // Optional: Confirm that the cart data has been updated
    //console.log("Updated cart: ", cartArray);

  } catch (error) {
    console.error("Error saving data: ", error);
  }
};


const AddToCartView = () => {
  const { itemCode } = useLocalSearchParams();

  const [itemData, setItemData] = useState([]);
  const [itemColors, setItemColors] = useState([]);
  const [itemSizes, setItemSizes] = useState([]);
  const [itemColorsImage, setItemColorsImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false); // State to track if image is in full-screen mode
  const [selectedColorID, setSelectedColorID] = useState(null); // State for selected color ID
  const [selectedColorName, setSelectedColorName] = useState('');
  const [selectedColorArabicName, setSelectedColorArabicName] = useState('');
  const [itemImageBasePath, setItemImageBasePath] = useState('');
  const [colorImageBasePath, setColorImageBasePath] = useState('');
  const [selectedItemSize, setSelectedItemSize] = useState('');
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar'; //
  
  const scrollY = new Animated.Value(0); // Track scroll position
  const screenHeight = Dimensions.get('window').height; // Get screen height to calculate dynamic sizes

  useEffect(() => {
    const fetchData = async () => {
      if (!itemCode) return;

      setLoading(true);

      try {
       // console.log("ipAddress "+ipAddress)
        const response = await axios.get('http://' + ipAddress + ':' + port + webAppPath + '/GetItemDetails', {
          params: { itemCode: itemCode },
        });

        const { itemDescList, itemColorsList, itemSizeTypeList, itemColorImages } = response?.data || {};

        setItemData(itemDescList || []);
        setItemColors(itemColorsList || []);
        setItemSizes(itemSizeTypeList || []);
        setItemColorsImage(itemColorImages || []);
        setSelectedColorID(itemColorsList[0][2] || null); // Set the first color as the default selected color
        setSelectedColorName(itemColorsList[0][3] || null); 
        setSelectedColorArabicName(itemColorsList[0][4] || null)

        if (response?.data?.imageBasePathDetails) {
            const details = response.data.imageBasePathDetails;
            const [itemImagesPath,colorImagesPath, relPath] = details[0]; 
            
            const itemImagePath =
            relPath === '1'
            ? 'http://' + ipAddress + ':' + port + webAppPath + itemImagesPath
            : 'http://' + ipAddress + ':' + port + itemImagesPath;

            setItemImageBasePath(itemImagePath); 

            const colorImagePath =
            relPath === '1'
            ? 'http://' + ipAddress + ':' + port + webAppPath + colorImagesPath
            : 'http://' + ipAddress + ':' + port + colorImagesPath;

            setColorImageBasePath(colorImagePath);
        } 
      
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setItemData([]);
        setItemColors([]);
        setItemSizes([]);
        setItemColorsImage([]);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [itemCode]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
   
  // Adjusting height of ItemImages based on scroll position
  const imageHeight = scrollY.interpolate({
    inputRange: [0, screenHeight * 0.7], // Start shrinking at 70% of the screen height
    outputRange: [screenHeight * 0.7, 0], // Shrink from 70% to 0 height
    extrapolate: 'clamp',
  });
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.carouselContainer, { height: imageHeight }]}>
        <ItemImages imageData={itemColorsImage[selectedColorID]} onFullScreenToggle={setIsFullScreen} itemImagePath={itemImageBasePath}  isRTL ={isRTL} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.detailsContainer}
        scrollEventThrottle={1000}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >

        {!isFullScreen && (
          <ItemDetailsComponent
            itemData={itemData}
            itemColors={itemColors}
            itemSizes={itemSizes[selectedColorID]}
            selectedColorID={selectedColorID} // Pass the selected color
            setSelectedColorID={setSelectedColorID} 
            colorImagePath={colorImageBasePath}
            selectedColorName={selectedColorName} // Pass the selected color
            setSelectedColorName={setSelectedColorName} 
            selectedColorArabicName={selectedColorArabicName}//pass selected color arabic name 
            setSelectedColorArabicName={setSelectedColorArabicName}
            setSelectedItemSize={setSelectedItemSize}
            isRTL ={isRTL}

          />
        )}

        {!isFullScreen && (
          <View style={styles.addToCartButtonContainer}>
            <TouchableOpacity style={styles.addToCartButton} onPress={() => {onAddCartPress(itemCode,itemData,selectedColorID,selectedColorName,selectedItemSize,itemImageBasePath,itemColorsImage[selectedColorID][0].IMAGE_NAME,t,selectedColorArabicName); }}>
              <Text style={styles.addToCartText}>{t('Add to Cart')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Navbar activetab="" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  carouselContainer: {
    width: '100%',
  },
  detailsContainer: {
    paddingTop: 10,
  },
  addToCartButtonContainer: {
    marginBottom: 20, // No extra space at the bottom
  },
  addToCartButton: {
    backgroundColor: 'black', // Button color
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginHorizontal: 20, // Optional: Add horizontal margin for button spacing
    marginBottom:35,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddToCartView;

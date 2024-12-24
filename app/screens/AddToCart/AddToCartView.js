import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import ItemImages from './ItemImages';
import ItemDetailsComponent from './ItemDetailsComponent';
import { useLocalSearchParams } from 'expo-router';
import { ipAddress, port, webAppPath } from '@env';


const onAddCartPress = (itemCode,selectedColorID,selectedColorName,selectedItemSize) => {
  
  console.log("item code  "+itemCode)
  console.log("selectedColorName "+selectedColorName)
  console.log("selectedColorID "+selectedColorID)
  console.log("selected size "+selectedItemSize)
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
  const [itemImageBasePath, setItemImageBasePath] = useState('');
  const [colorImageBasePath, setColorImageBasePath] = useState('');
  const [selectedItemSize, setSelectedItemSize] = useState('');


  const scrollY = new Animated.Value(0); // Track scroll position
  const screenHeight = Dimensions.get('window').height; // Get screen height to calculate dynamic sizes

  useEffect(() => {
    const fetchData = async () => {
      if (!itemCode) return;

      setLoading(true);

      try {
        console.log("ipAddress "+ipAddress)
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
        <ItemImages imageData={itemColorsImage[selectedColorID]} onFullScreenToggle={setIsFullScreen} itemImagePath={itemImageBasePath} />
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
            setSelectedItemSize={setSelectedItemSize}

          />
        )}

        {!isFullScreen && (
          <View style={styles.addToCartButtonContainer}>
            <TouchableOpacity style={styles.addToCartButton} onPress={() => {onAddCartPress(itemCode,selectedColorID,selectedColorName,selectedItemSize); }}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddToCartView;

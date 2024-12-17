import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {ipAddress,port,webAppPath} from "@env";

const baseUrl = 'http://'+ipAddress+':'+port+webAppPath;  // Base URL for image path
const { width, height } = Dimensions.get('window'); 

const ItemImages = ({ imageData, onFullScreenToggle }) => {
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isFullScreen, setIsFullScreen] = useState(false); 
  const [clickedIndex, setClickedIndex] = useState(null); 

  // Handle the back button event
  const handleBackPress = () => {
    if (isFullScreen) {
      setIsFullScreen(false);  // Close full-screen mode when back button is pressed
      onFullScreenToggle(false); 
      return true;  
    }
    return false;  
  };

  // Add back button event listener on mount and clean up on unmount
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isFullScreen]);

  const renderImage = (item, index) => {
    const imagePath = item.IMAGE_PATH ? item.IMAGE_PATH.replace(/\\/g, '/') : ''; 
    const imageName = item.IMAGE_NAME || '';

    // Construct the full URL for the image
    const imageUrl = imagePath && imageName ? `${baseUrl}${imagePath}/${imageName}` : '';

    return (
      <TouchableOpacity
        onPress={() => {
          setClickedIndex(index); // Set clicked image's index
          setIsFullScreen(true);   // Activate full-screen mode when image is clicked
          onFullScreenToggle(true); // Notify parent to open full-screen
        }}
        activeOpacity={1}  // Disables the default opacity effect when pressed
      >
        <View style={[styles.imageContainer, isFullScreen && styles.fullScreenImageContainer]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }} // Use the full image URL
              style={styles.image}
            />
          ) : (
            <Text>Image not available</Text>
          )}
          {/* Counter display */}
          <View style={styles.indexContainer}>
            <Text style={styles.indexText}>
              {currentIndex + 1} / {imageData.length}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={isFullScreen ? width : width}  // Full width for full-screen mode
        height={isFullScreen ? height : height * 0.70}  // Full height for full-screen mode or 65% of height for normal mode
        autoPlay={false}
        data={imageData}
        initialIndex={clickedIndex || currentIndex}  // Ensure carousel starts at the clicked image
        onSnapToItem={(index) => setCurrentIndex(index)} // Update current index on swipe
        renderItem={({ item, index }) => renderImage(item, index)}  // Render images from imageData
        scrollEnabled={true}  // Enable swipe functionality even in full-screen mode
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width,  
    height: height * 0.70, 
    overflow: 'hidden', 
  },
  fullScreenImageContainer: {
    width: width,  
    height: height, 
    backgroundColor: 'black', 
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',  
    height: '100%', 
  },
  indexContainer: {
    position: 'absolute',
    bottom: 20,  
    left: '50%',  
    marginLeft: -40,  
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  indexText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default ItemImages;

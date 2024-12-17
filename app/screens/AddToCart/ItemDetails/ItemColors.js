import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import {ipAddress,port,webAppPath} from "@env";

// Handler when color is pressed to set the selected color
const onColorPress = (colorID, setSelectedColorID) => {
  setSelectedColorID(colorID);
};

const Color = ({ item, onPress, isSelected }) => {
  const imagePath = item[1] ? item[1].replace(/\\/g, '/') : ''; 

  return (
    <TouchableOpacity onPress={onPress} style={[styles.color]}>
      <View
        style={[
          styles.imageContainer,
          isSelected && styles.selectedImageContainer, // Apply ring effect when selected
        ]}
      >
        <Image
          source={{ uri: 'http://'+ipAddress+':'+port+'/'+webAppPath+imagePath + '/' + item[0] }}
          style={styles.image}
        />
      </View>
    </TouchableOpacity>
  );
};

const ItemColors = ({ itemColors, selectedColorID, setSelectedColorID }) => {

  useEffect(() => {
    if (itemColors.length > 0 && !selectedColorID) {
      setSelectedColorID(itemColors[0][2]); // Ensure the first color is selected
    }
  }, [itemColors, selectedColorID, setSelectedColorID]);

  const renderColor = ({ item }) => (
    <Color
      item={item}
      onPress={() => {
        onColorPress(item[2], setSelectedColorID); // Update selected color when pressed
      }}
      isSelected={item[2] === selectedColorID} // Determine if this color is selected
    />
  );

  // Find the selected color by its ID
  const selectedColor = itemColors.find(item => item[2] === selectedColorID);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color: {selectedColor ? selectedColor[3] : ''}</Text>
      <FlatList
        data={itemColors}
        renderItem={renderColor}
        keyExtractor={(item) => item[2].toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
  },
  selectedColorText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  color: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  imageContainer: {
    width: 60,                    
    height: 60,                    
    borderRadius: 30,              
    overflow: 'hidden',            
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    borderWidth: 2,                
    borderColor: 'black',          
  },
  image: {
    width: '150%',                
    height: '150%',                
    resizeMode: 'cover',           
  },
});

export default ItemColors;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';  // Importing useTranslation hook
//import {ipAddress,port,webAppPath} from "@env";


// Handler when color is pressed to set the selected color
const onColorPress = (colorID, setSelectedColorID,colorName,setSelectedColorName,setSelectedItemSize,arabicColorName,setSelectedColorArabicName) => {
  setSelectedColorID(colorID);
  setSelectedColorName(colorName);
  setSelectedColorArabicName(arabicColorName)
  setSelectedItemSize('');
};

const Color = ({ item, onPress, isSelected,colorImagePath }) => {
 
  return (
    <TouchableOpacity onPress={onPress} style={[styles.color]}>
      <View
        style={[
          styles.imageContainer,
          isSelected && styles.selectedImageContainer, // Apply ring effect when selected
        ]}
      >
        <Image
          source={{ uri: colorImagePath+ item[0] }}
          style={styles.image}
        />
      </View>
    </TouchableOpacity>
  );
};

const ItemColors = ({ itemColors, selectedColorID, setSelectedColorID ,colorImagePath,selectedColorName,setSelectedColorName,setSelectedItemSize,isRTL,selectedColorArabicName,setSelectedColorArabicName}) => {
//console.log("item color "+itemColors)
const { t, i18n } = useTranslation(); 


  useEffect(() => {
    if (itemColors.length > 0 && !selectedColorID) {
      setSelectedColorID(itemColors[0][2]); // Ensure the first color is selected
    }
  }, [itemColors, selectedColorID, setSelectedColorID]);

  const renderColor = ({ item }) => (
    <Color
      item={item}
      onPress={() => {
        onColorPress(item[2], setSelectedColorID,item[3],setSelectedColorName,setSelectedItemSize,item[4],setSelectedColorArabicName); // Update selected color when pressed
      }}
      isSelected={item[2] === selectedColorID} // Determine if this color is selected
      colorImagePath={colorImagePath}
    />
  );

  // Find the selected color by its ID
  const selectedColor = itemColors.find(item => item[2] === selectedColorID);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('color')}: {selectedColor ? isRTL ? selectedColor[4] : selectedColor[3] : ''}</Text>
      <FlatList
        data={itemColors}
        renderItem={renderColor}
        keyExtractor={(item) => item[2].toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    marginRight:5
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
    width: 40,                    
    height: 40,                    
    borderRadius: 30,              
    overflow: 'hidden',            
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImageContainer: {
    borderWidth: 1,                
    borderColor: 'black',          
  },
  image: {
    width: '95%',                
    height: '95%',                
    resizeMode: 'cover',           
  },
});

export default ItemColors;

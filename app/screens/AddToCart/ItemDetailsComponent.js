import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ItemDetails from './ItemDetails/ItemDetails';
import ItemColors from './ItemDetails/ItemColors';
import ItemSizes from './ItemDetails/ItemSizes';

const ItemDetailsComponent = ({ itemData, itemColors, itemSizes, selectedColorID, setSelectedColorID ,colorImagePath,selectedColorName,setSelectedColorName,setSelectedItemSize,isRTL,selectedColorArabicName,setSelectedColorArabicName}) => {
  return (
    <View style={styles.container}>
      <ItemDetails itemData={itemData} isRTL={isRTL} />
      <ItemColors 
        itemColors={itemColors} 
        selectedColorID={selectedColorID} // Pass the selectedColorID
        setSelectedColorID={setSelectedColorID} // Pass the function to set selectedColorID
        colorImagePath ={colorImagePath}
        selectedColorName={selectedColorName} // Pass the selectedColorID
        setSelectedColorName={setSelectedColorName} // Pass the function to set selectedColorID
        selectedColorArabicName={selectedColorArabicName}
        setSelectedColorArabicName={setSelectedColorArabicName}
        setSelectedItemSize={setSelectedItemSize}
        isRTL={isRTL}

      />

      <ItemSizes
        itemSizes={itemSizes} 
        setSelectedItemSize={setSelectedItemSize}
        isRTL={isRTL}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

export default ItemDetailsComponent;

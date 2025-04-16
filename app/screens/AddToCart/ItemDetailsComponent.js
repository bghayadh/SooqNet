import React,{useState,useEffect}from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ItemDetails from './ItemDetails/ItemDetails';
import ItemColors from './ItemDetails/ItemColors';
import ItemSizes from './ItemDetails/ItemSizes';

const ItemDetailsComponent = ({ itemData, itemColors, itemSizes, selectedColorID, setSelectedColorID ,colorImagePath,selectedColorName,setSelectedColorName,setSelectedItemSize,isRTL,selectedColorArabicName,setSelectedColorArabicName}) => {
  const [noSizeNoColor, setNoSizeNoColor] = useState([]);
  const [noSize, setNoSize] = useState([]);
  const [noQuantityCheck, setNoQuantityCheck] = useState([]);
  useEffect(() => {
    if (itemData && itemData[0]) {
      setNoSizeNoColor(itemData[0][8]);
      setNoSize(itemData[0][9]);
      setNoQuantityCheck(itemData[0][10]);
    }
  }, [itemData]);
  

  return (
    <View style={styles.container}>
      <ItemDetails itemData={itemData} isRTL={isRTL} />
      {noSizeNoColor != 1 && (
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
          noSizeNoColor={noSizeNoColor}

        />
    )}
    {noSizeNoColor != 1 && noSize != 1 && (
      <ItemSizes
        itemSizes={itemSizes} 
        setSelectedItemSize={setSelectedItemSize}
        isRTL={isRTL}
        noSizeNoColor={noSizeNoColor}
        noSize={noSize}
        noQuantityCheck={noQuantityCheck}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

export default ItemDetailsComponent;

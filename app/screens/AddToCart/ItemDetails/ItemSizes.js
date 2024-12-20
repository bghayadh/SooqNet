import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

// Handler when size is pressed to set the selected size
const onSizePress = (sizeID, sizeDimensionOne, sizeDimensionTwo, setSelectedSize) => {
  setSelectedSize(sizeID);  // Set the clicked size as selected
  //console.log(`onSizePress - SizeID: ${sizeID}, Dimension 1: ${sizeDimensionOne}, Dimension 2: ${sizeDimensionTwo}`);
};

const Size = ({ item, onPress, isSelected }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.size]}>
      <View style={[styles.sizeContainer, isSelected && styles.selectedSize]}>
        {item.SIZE_DIMENSION_ONE || item.SIZE_DIMENSION_TWO ? (
          <Text style={styles.sizeText}>
            {item.SIZE_DIMENSION_ONE}
            {item.SIZE_DIMENSION_ONE && item.SIZE_DIMENSION_TWO ? ' | ' : ''}
            {item.SIZE_DIMENSION_TWO}
          </Text>
        ) : (
          <Text style={styles.sizeText}>No dimensions available</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ItemSizes = ({ itemSizes }) => {
  const [selectedSize, setSelectedSize] = useState(null); // State to track selected size

  const renderSize = ({ item }) => (
    <Size
      item={item}
      onPress={() => {
        onSizePress(item.ID, item.SIZE_DIMENSION_ONE, item.SIZE_DIMENSION_TWO, setSelectedSize);
      }}
      isSelected={selectedSize === item.ID} // Highlight if selected
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sizes:</Text>
      <FlatList
        data={itemSizes}
        renderItem={renderSize}
        keyExtractor={(item) => item.ID.toString()} // Unique key for each item
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  size: {
    padding: 2,
    margin: 2,
  },
  sizeContainer: {
    width: 60, // Set a fixed width for each button
    height: 43, // Set a fixed height for each button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc', // Default border color
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2, // Optional: add some horizontal margin between buttons
  },
  selectedSize: {
    borderWidth: 1, // Thicker border for selected size
    borderColor: '#000', // Black color for selected size's border
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default ItemSizes;

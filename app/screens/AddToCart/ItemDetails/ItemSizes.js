import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

// Handler when size is pressed to set the selected size
const onSizePress = (sizeID, sizeDimensionOne, sizeDimensionTwo) => {
  //console.log(`onSizePress - SizeID: ${sizeID}, Dimension 1: ${sizeDimensionOne}, Dimension 2: ${sizeDimensionTwo}`);
};

const Size = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.size]}>
      <View style={[styles.sizeContainer]}>
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
  const renderSize = ({ item }) => (
    <Size
      item={item}
      onPress={() => {
        onSizePress(item.ID, item.SIZE_DIMENSION_ONE, item.SIZE_DIMENSION_TWO);
      }}
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
    padding: 5,
    margin: 5,
  },
  sizeContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,  
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default ItemSizes;

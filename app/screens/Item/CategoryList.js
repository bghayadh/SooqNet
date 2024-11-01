import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const Category = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor }]}>
    <Image
      source={{ uri: 'http://192.168.0.108:8080/osc/resources/images/CategoriesImages/' + item[2] }}
      style={styles.image}
    />
    <Text style={[styles.title, { color: textColor }]}>
      {item[1]} 
    </Text>
  </TouchableOpacity>
);

const CategoryList = ({ data }) => {
  const [selectedId, setSelectedId] = useState(null);

  const renderCategory = ({ item }) => {
   // const backgroundColor = item === selectedId ? '#6e3b6e' : 'white';
    //const color = item === selectedId ? 'white' : 'black';

    return (
      <Category
        item={item}
        onPress={() => {
          setSelectedId(item);
          console.log(item[0]);
          // Handle navigation or any other logic here
        }}
        backgroundColor={'white'}
        textColor={'black'}
      />
    );
  };

  return (
    <View>
      {data.length === 0 ? (
        <Text>No categories found</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderCategory}
          keyExtractor={(item) => item[0].toString()} // Assuming item[0] is a unique identifier
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
      fontSize: 16,
    },
    cat: {
      padding: 5,
      margin: 5,
      borderRadius: 5,
      alignItems: 'center',
      height: 100,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: 5,
    },
    horizontalList: {
      paddingVertical: 5,
    },
});

export default CategoryList;

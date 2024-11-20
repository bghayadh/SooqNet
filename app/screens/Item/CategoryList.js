import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const Category = ({ item, onPress, isSelected }) => {
    const backgroundColor = isSelected ? '#d3d3d3' : 'white'; // Highlight color for selected category
    const textColor = isSelected ? 'black' : 'black'; // Text color

    return (
        <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor }]}>
                  <View style={styles.imageContainer} >
            <Image
                source={{ uri: 'http://192.168.1.75:8080/osc/resources/images/CategoriesImages/' + item[2] }}
                style={styles.image}
            /></View>
            <Text style={[styles.title, { color: textColor }]}>
                {item[1]} 
            </Text>
        </TouchableOpacity>
    );
};

const CategoryList = ({ data, onCategoryPress, lastCatLevel, selectedId }) => {
    const renderCategory = ({ item }) => (
        <Category
            item={item}
            onPress={() => {
                onCategoryPress(item[0]); 
            }}
            isSelected={lastCatLevel && selectedId === item[0]} 
        />
    );

    return (
        <View>
                <FlatList
                    data={data}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item[4].toString()} 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalList}
                />
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
        height: 130,
    },
    imageContainer: {
        width: 75,
        height:90,               
        aspectRatio: 1,              
        borderRadius: 50,         
        overflow: 'hidden',       
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',   
      },
      image: {
        width: '100%',          
        height: '100%',
        resizeMode:'stretch',
      },
    horizontalList: {
        paddingVertical: 5,
    },
});

export default CategoryList;

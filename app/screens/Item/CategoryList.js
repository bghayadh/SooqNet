import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const Category = ({ item, onPress, isSelected }) => {
    const backgroundColor = isSelected ? '#d3d3d3' : 'white'; // Highlight color for selected category
    const textColor = isSelected ? 'black' : 'black'; // Text color

    return (
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
            {data.length === 0 ? (
                <Text>No categories found</Text>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item[0].toString()} 
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

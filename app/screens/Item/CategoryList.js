import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import i18next from 'i18next';

 
 
const Category = ({ item,isRTL, onPress, isSelected ,catImagesPath}) => {
    const backgroundColor = isSelected ? '#d3d3d3' : 'white'; // Highlight color for selected category
    const textColor = isSelected ? 'black' : 'black'; // Text color

    return (
        <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor }]}>
                  <View style={styles.imageContainer} >
            <Image
                source={{ uri: catImagesPath+ item[2] }}
                style={styles.image}
            /></View>
            <Text style={[styles.title, { color: textColor }]}>
            {isRTL ? item[5] : item[1]}
            </Text>
        </TouchableOpacity>
    );
};

const CategoryList = ({ data, onCategoryPress, lastCatLevel, selectedId, catImagesPath }) => {
    const lang = i18next.language;
    const isRTL = lang === 'ar'; 

    const renderCategory = ({ item }) => (
        <Category
            item={item}
            isRTL={isRTL}
            onPress={() => {
                onCategoryPress(item[0], item[1],item[5]); 
            }}
            isSelected={lastCatLevel && selectedId === item[0]} 
            catImagesPath={catImagesPath}
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
                style={[
                    styles.horizontalList,
                    isRTL && { alignSelf: 'flex-start', marginRight: 0, marginLeft: 'auto' }, // Align the whole FlatList container
                ]}
                contentContainerStyle={isRTL ? { flexDirection: 'row-reverse' } : {}}
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

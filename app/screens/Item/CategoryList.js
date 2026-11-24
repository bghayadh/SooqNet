import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import i18next from 'i18next';
 
const Category = ({ item,isRTL, onPress, isSelected ,catImagesPath}) => {
    const backgroundColor = isSelected ? '#d3d3d3' : 'white'; // Highlight color for selected category
    const textColor = isSelected ? 'black' : 'black'; // Text color
    

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.cat,
                { backgroundColor },
                isRTL ? styles.catRtl : styles.catLtr,
            ]}
        >
            <View style={styles.imageContainer} >
                <Image
                    source={{ uri: catImagesPath+ item[2] }}
                    style={styles.image}
                />
            </View>
            <Text
                numberOfLines={2}
                style={[
                    styles.title,
                    { color: textColor },
                    isRTL ? styles.titleRtl : styles.titleLtr,
                ]}
            >
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
        fontSize: 13,
        maxWidth: 110,
    },
    cat: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginHorizontal: 3,
        marginVertical: 2,
        borderRadius: 5,
        height: 58,
    },
    catLtr: {
        flexDirection: 'row',
    },
    catRtl: {
        flexDirection: 'row-reverse',
    },
    titleLtr: {
        marginLeft: 6,
        textAlign: 'left',
    },
    titleRtl: {
        marginRight: 6,
        textAlign: 'right',
    },
    imageContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
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
        paddingVertical: 2,
    },
});

export default CategoryList;

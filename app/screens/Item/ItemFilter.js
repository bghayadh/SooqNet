import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,Image } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const ItemFilter = ({ onSortChange, selectedSort, onDropdownToggle, sizeOptions, selectedSizes, onSizeChange}) => {
    const [activeDropdown, setActiveDropdown] = useState(null); // To track active dropdown
    const [buttonPositions, setButtonPositions] = useState({ sort: 0, size: 0 }); // To store button positions
    const sortOptions = ['Name A to Z', 'Name Z to A', 'Price Low to High', 'Price High to Low'];
    const screenHeight = Dimensions.get('window').height; // To get the screen height

  
    const handleSizeToggle = (size) => {
        const updatedSizes = selectedSizes.includes(size)
            ? selectedSizes.filter((s) => s !== size) // Remove the unselected size from array
            : [...selectedSizes, size]; // Add the selected size to array
        onSizeChange(updatedSizes); // Notify the parent of the change
    };

    const toggleDropdown = (dropdownType) => {
        setActiveDropdown((prev) => (prev === dropdownType ? null : dropdownType));
        onDropdownToggle(activeDropdown !== dropdownType); // Notify parent about dropdown state
    };

    const capturePosition = (type, event) => {
        const { y } = event.nativeEvent.layout;
        setButtonPositions((prev) => ({ ...prev, [type]: y }));
    };

    const calculateDropdownHeight = () => {
        const itemsPerRow = 4; // Number of items per row
        const rowHeight = 60 + 15; // Item height + row gap
        const numberOfRows = Math.ceil(sizeOptions.length / itemsPerRow);
        const totalHeight = numberOfRows * rowHeight;
        const maxHeight = screenHeight * 0.5; // Limit to 50% of screen height
        return totalHeight > maxHeight ? maxHeight : totalHeight;
    };
    
    return (
        <View style={styles.container}>
            {/* Horizontal ScrollView for filter buttons */}
            <ScrollView 
                horizontal={true}
                showsHorizontalScrollIndicator={false} // Hides the scroll indicator
                style={[
                    styles.scrollContainer,
                    activeDropdown ? styles.overlayScrollContainer : styles.scrollContainer,
                ]}
            >
            {/* Sort By filter button */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity onLayout={(e) => capturePosition('sort', e)} style={styles.filterButton} onPress={() => toggleDropdown('sort')} >
                        <Text style={styles.filterText}>Sort By  </Text>
                        <Icon name={activeDropdown === 'sort' ? 'up' : 'down'} size={14} color="black" />
                    </TouchableOpacity>
                </View>
            {/* Size filter button */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity onLayout={(e) => capturePosition('size', e)} style={styles.filterButton} onPress={() => toggleDropdown('size')} >
                        <Text style={styles.filterText}>Size  </Text>
                        <Icon name={activeDropdown === 'size' ? 'up' : 'down'} size={14} color="black" />
                    </TouchableOpacity>
                </View>
        </ScrollView>

            {/* Common Dropdown Content View (its content depends on the activeDropdown ) */}
            {activeDropdown && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            width: activeDropdown === 'sort' ? 200 : 330, // Small width for the sortBy content
                            maxHeight: calculateDropdownHeight(), 
                            top:
                                activeDropdown === 'sort'
                                    ? buttonPositions.sort + 5
                                    : activeDropdown === 'size'
                                    ? buttonPositions.size + 5
                                    : buttonPositions.color + 5, // Dynamic top based on button position
                        },
                    ]}
                >
                    {activeDropdown === 'sort' ? (
                        <ScrollView contentContainerStyle={styles.scrollableDropdown} keyboardShouldPersistTaps="handled" >
                            {sortOptions.map((option, index) => (
                                <TouchableOpacity key={index} onPress={() => onSortChange(option)} style={styles.optionContainer} >
                                    <View style={styles.radioButton}>
                                        {selectedSort === option && <View style={styles.radioButtonSelected} />}
                                    </View>
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : activeDropdown === 'size' ? (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                            <View style={styles.sizeOptionsContainer}>
                                {sizeOptions.map((size, index) => (
                                    <TouchableOpacity key={index} onPress={() => handleSizeToggle(size)}
                                        style={[
                                            styles.sizeOption,
                                            selectedSizes.includes(size) && styles.selectedFilterOption,
                                        ]}
                                    >
                                        <Text style={styles.sizeText}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    ) : (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        top:-20,
        position: 'absolute', // Ensure dropdown aligns relative on ItemList
        zIndex: 10000, // High enough to prevent interference
        
    },
    scrollContainer: {
        backgroundColor: 'white',
    },
    overlayScrollContainer: {
        backgroundColor: 'transparent',
    },
    filterContainer: {
        marginRight: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        height: 40,
        width: 100,
        justifyContent: 'center',
    },
    filterText: {
        fontSize: 18,
        color: 'black',
    },
    dropdown: {
        position: 'relative', // Renders dropdown above other content
        backgroundColor: 'white',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 2000,
        elevation: 10, 
        maxHeight: 300, // Limit height to make it scrollable
        overflow: 'hidden',
    },
    sizeOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        rowGap: 15,                 
        marginHorizontal: 5, 
    },
    sizeOption: {
        width: '22%',
        aspectRatio: 2.5,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: 80,
        marginLeft: 5,              
    },
    selectedFilterOption: {
        backgroundColor: '#BEBEBE',
        borderColor: 'black',
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioButtonSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0096FF',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    optionText: {
        fontSize: 16,
    },
 scrollableDropdown: {
    flexGrow: 1, 
    overflow: 'scroll',
    },

});

export default ItemFilter; 
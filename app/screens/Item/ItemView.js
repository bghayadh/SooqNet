import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, Text, BackHandler } from 'react-native';
import ItemList from './ItemList';
import CategoryList from './CategoryList';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

function ItemView() {
    const { catCode, source, searchKey } = useLocalSearchParams();
    const [itemData, setItemData] = useState([]);
    const [catData, setCatData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullCatCode, setFullCatCode] = useState(catCode || ""); // Initialize with catCode
    const [lastCatLevel, setLastCatLevel] = useState(false); 

    useEffect(() => {
        const fetchData = async () => {
            if (!fullCatCode) return; // Prevent fetch if no category code

            try {
                setLoading(true);
                const response = await axios.get('http://192.168.0.108:8080/osc/SooqNetGetCatItem', {
                    params: { catID: fullCatCode, source, searchKey },
                });

                // Handle item data
                setItemData(response?.data?.category1List || []);
                // Handle category data
                setCatData(response?.data?.subCategory1List || []);
                // Set lastCatLevel from server response
                setLastCatLevel(response?.data?.lastCatLevel || false);
            } catch (error) {
                console.error("Error fetching data:", error.message);
                setItemData([]);
                setCatData([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fullCatCode, source, searchKey]); 

    // Function to handle category selection
    const handleCategoryPress = (newCatCode) => {
        const codes = fullCatCode.split('-');

        if (lastCatLevel && codes.length > 0) {
            // Replace the last category if lastCatLevel is true
            if (codes[codes.length - 1] === newCatCode) {
                // If the new category is the same as the last one, do nothing
                return;
            } else {
                // Replace the last category with the new category
                codes[codes.length - 1] = newCatCode;
            }
        } else {
            // Combine with dash if not empty
            codes.push(newCatCode);
        }

        const combinedCatCode = codes.join('-'); // Join back into a single string
        setFullCatCode(combinedCatCode); // This will trigger the useEffect to fetch data
    };

    // BackHandler to manage back button behavior
    useEffect(() => {
        const backAction = () => {
            const codes = fullCatCode.split('-');
            if (codes.length > 1) {
                const updatedCatCode = codes.slice(0, -1).join('-'); // Remove the last category code
                setFullCatCode(updatedCatCode);
                return true; 
            }
            return false; 
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove(); // Clean up the event listener
    }, [fullCatCode]);

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <View style={styles.listContainer}>
                    <CategoryList 
                        data={catData} 
                        onCategoryPress={handleCategoryPress} 
                        lastCatLevel={lastCatLevel} 
                        selectedId={fullCatCode.split('-').pop()} 
                    />
                    <ItemList data={itemData} />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        padding: 10,
    },
});

export default ItemView;

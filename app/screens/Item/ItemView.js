import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, Text } from 'react-native';
import ItemList from './ItemList';
import CategoryList from './CategoryList';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

function ItemView() {
    const [itemData, setItemData] = useState([]);
    const [catData, setCatData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { catCode, source, searchKey } = useLocalSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://192.168.0.108:8080/osc/SooqNetGetCatItem', {
                    params: { catID: catCode, source, searchKey },
                });

                // Handle item data
                if (response?.data?.category1List) {
                    setItemData(response.data.category1List);
                } else {
                    setItemData([]);
                }

                // Handle category data
                if (response?.data?.subCategory1List) {
                    setCatData(response.data.subCategory1List);
                } else {
                    setCatData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error.message);
                setItemData([]);
                setCatData([]); // Reset categories on error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [catCode, source, searchKey]);

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <View style={styles.listContainer}>
                    <CategoryList data={catData} />
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

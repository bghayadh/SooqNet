import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';


const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
    <Text style={[styles.title, { color: textColor }, { marginLeft: 2 }]}>
      {item[0]} {}
    </Text>
  </TouchableOpacity>
);

const HomePage = () => {
  const [selectedId, setSelectedId] = useState();
  const [data, setData] = useState([]); // to store the data array from axios
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.1.109:8080/osc/SooqNetGetCat1', {
          params: {}
        });

        if (response && response.data && response.data.category1List) {
          setData(response.data.category1List); //Append the returned data into flatList
        } 
        else {
          console.log("No data found.");
          setData([]); // Set empty data if no data is returned
        }
      } catch (error) {
        console.error("There was an error!", error.message);
        setData([]); // Handle error by setting empty data
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
  }, []);

  const renderItem = ({ item }) => {
    const backgroundColor = item === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item === selectedId ? 'white' : 'black';

    return (
      <Item
        item={item} 
        onPress={() => {
          setSelectedId(item);
          router.push({ pathname: '/screens/Item/ItemList', params: { catCode: item[1] } });
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text>Loading...</Text> // Display loading while fetching data
      ) : (
        <View style={styles.centeredContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled={false}
            alwaysBounceVertical={false}>
            <FlatList
              numColumns={Math.ceil(data.length / 2)} // Use dynamic data length
              data={data} // Use the fetched category1List data
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()} // Use index as key since inner arrays don't have unique IDs
              extraData={selectedId}
              style={{ flexGrow: 0 }} // Ensure FlatList doesn't collapse
            />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 2,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
  },
  centeredContainer: {
    flex: 1,
    position: 'absolute',   
    top: '40%',        
    backgroundColor:'white'
  },
});

export default HomePage;

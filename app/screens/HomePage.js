import React, { useState, useEffect } from 'react';
import {FlatList,SafeAreaView,StatusBar,StyleSheet,Text,TouchableOpacity,ScrollView,View,Image,Keyboard,TouchableWithoutFeedback} from 'react-native';
import axios from 'axios';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons'; 
import ItemSearch from './Item/ItemSearch';

const Category = ({ category, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor }]}>
    <Image
      source={{ uri: 'http://192.168.1.109:8080/osc/resources/images/CategoriesImages/' + category[2] }}
      style={styles.image}
    />
    <Text style={[styles.title, { color: textColor }]}>{category[0]}</Text>
  </TouchableOpacity>
);

const HomePage = () => {
  const [selectedId, setSelectedId] = useState();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlatList, setShowFlatList] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]); 
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.1.109:8080/osc/SooqNetGetCat1');
        if (response && response.data && response.data.category1List) {
          setData(response.data.category1List);
        } else {
          console.log("No data found.");
          setData([]);
        }
      } catch (error) {
        console.error("There was an error!", error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCategory = ({ item }) => {
    return (
      <Category
        category={item}
        onPress={() => {
          setSelectedId(item);
          router.push({ pathname: '/screens/Item/ItemView', params: { 
            catCode: item[1],
            source: 'category',
           } });
        }}
        backgroundColor='white'
        textColor='black'
      />
    );
  };


 //Update the list of displayed items and toggles the visibility of main flatList before the search
  const handleSearchResults = (results, showCategoriesState) => {
    setShowFlatList(showCategoriesState);
    setSearchResults(results);
  };
  
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (searchText === '') {
          Keyboard.dismiss(); // Dismiss the keyboard if searchText is empty
          setShowFlatList(true);
        }
      }}
    >
    <SafeAreaView style={styles.container}>
    <ItemSearch
        searchText={searchText}
        setSearchText={setSearchText}
        setShowFlatList={setShowFlatList}
        onSearchResults={handleSearchResults}
      />
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          showFlatList ? (
            <View style={styles.centeredContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FlatList
                  numColumns={Math.ceil(data.length / 2)}
                  data={data}
                  renderItem={renderCategory}
                  keyExtractor={(item, index) => index.toString()}
                  extraData={selectedId}
                  style={{ flexGrow: 0 }}
                />
              </ScrollView>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => {
                  router.push({
                    pathname: '/screens/Item/ItemView',
                    params: {
                      catCode: result.categoryCode,
                      source: 'search',
                      searchKey: searchText,
                    },
                  });
                }}
              >
                <Text style={styles.resultText}>{result.title}</Text>
                <Text style={styles.resultCount}>{result.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
          )
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  resultsContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 16,
    color: 'black',
  },
  resultCount: {
    fontSize: 16,
    color: 'gray',
  },
  cat: {
    padding: 2,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    position: 'absolute',
    top: '30%',
    backgroundColor: 'white',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
});

export default HomePage;

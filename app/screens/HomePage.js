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
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

// Search component
const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  // Trigger the search function when Enter from keyboard is pressed
  const handleSubmitEditing = () => {
    onSearch(searchText);
  };

  const handleChangeText = (text) => {
    setSearchText(text);
    if (text === '') {
      onSearch(text);
    }
  };

  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#999"
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        value={searchText}
        returnKeyType="search"
      />
       <TouchableOpacity onPress={handleSubmitEditing} style={styles.iconContainer}>
        <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
      </TouchableOpacity>
    </View>
  );
};

const Category = ({ category, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor }]}>
    <Image
      source={{ uri: 'http://192.168.0.108:8080/osc/resources/images/CategoriesImages/' + category[2] }}
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
        const response = await axios.get('http://192.168.0.108:8080/osc/SooqNetGetCat1');
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

  const handleSearch = async (searchKey) => {
    setSearchText(searchKey);// set the new value of search
    if (searchKey) {
      setShowFlatList(false);// Hide the flatList that contains the cat1 with their images
      try {
        const response = await axios.get('http://192.168.0.108:8080/osc/GetCategory1BySearchKey', {
          params: { searchKey: searchKey },
        });

        if (response && response.data && response.data.cat1TitlesList &&  response.data.cat1ItemsList) {
          
          const cat1TitlesList = response.data.cat1TitlesList;
          const cat1ItemsList = response.data.cat1ItemsList;
          
          //Append the new flatList that contains the searched cat
          const results = [
            { title: 'All', count: cat1ItemsList.length, categoryCode: 'ALL' },
            ...cat1TitlesList.map((element) => {
              const cat1Code = element[0];
              const count = cat1ItemsList.reduce((acc, itemCatCode) => {
                return itemCatCode[0] === cat1Code ? acc + 1 : acc;
              }, 0);
              return { title: element[1], count, categoryCode: cat1Code };
            }),
          ];
          setSearchResults(results);
          Keyboard.dismiss(); // Hide the keyboard
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setShowFlatList(true);
    }
  };

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

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (searchText === '') {
          Keyboard.dismiss(); // Dismiss the keyboard if searchText is empty
        }
      }}
    >
    <SafeAreaView style={styles.container}>
        <SearchBar onSearch={handleSearch} />
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
                      router.push({ pathname: '/screens/Item/ItemView', 
                        params: { 
                        catCode: result.categoryCode,
                        source: 'search',  
                        searchKey: searchText,        
                    } });
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 16,
    marginTop: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
  iconContainer: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 30,
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

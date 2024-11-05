import React from 'react';
import {View,TextInput,TouchableOpacity,StyleSheet,Keyboard} from 'react-native';
import axios from 'axios';
import {Ionicons} from '@expo/vector-icons';


const ItemSearch = ({ searchText, setSearchText,setShowFlatList, onSearchResults }) => {

  // when pressing the search button on the keyboard,this function is called
  const handleSubmitEditing = async () => {
    try {
      const results = await handleSearch(searchText); // calling the function of axios to fetch data
      onSearchResults(results, false); // sending the result from the search request back to home page
      Keyboard.dismiss();
    } 
    catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  //it's called whenever the text in the search input changes
  const handleChangeText = (text) => {
    setSearchText(text); // set the new value
    if (text === '') {
      onSearchResults([]); // Clear results if input is empty
    }
  };

  //This function sends the axios request to fetch data
  const handleSearch = async (searchKey) => {

    if (searchKey) {

      setShowFlatList(false);// Hide other flatList (cond. flatList)
      const response = await axios.get('http://192.168.1.109:8080/osc/GetCategory1BySearchKey', {
        params: { searchKey }
      });

      if (response && response.data && response.data.cat1TitlesList && response.data.cat1ItemsList) {
      
        const cat1TitlesList = response.data.cat1TitlesList;
        const cat1ItemsList = response.data.cat1ItemsList;
          
        return [
          { title: 'All', count: cat1ItemsList.length, categoryCode: 'AllCatOptions', searchText },
          ...cat1TitlesList.map((element) => {
            const cat1Code = element[0];
            const count = cat1ItemsList.reduce((acc, itemCatCode) => 
              itemCatCode[0] === cat1Code ? acc + 1 : acc, 0);
            return { title: element[1], count, categoryCode: cat1Code, searchText };
          }),
        ];
      }
    }
    else {
      setShowFlatList(true);
    }
    return [];
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

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 30,
  },
  iconContainer: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -10,
  },
});

export default ItemSearch;
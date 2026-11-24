import React, { useEffect,useRef ,} from 'react';
import {View,TextInput,TouchableOpacity,StyleSheet,Keyboard,I18nManager } from 'react-native';
import axios from 'axios';
import {Ionicons} from '@expo/vector-icons';
import {ipAddress,port,webAppPath,url} from "@env";
import i18next from 'i18next';

const ItemSearch = ({ searchText, setSearchText,setShowFlatList, onSearchResults }) => {

  const inputRef = useRef(null); // Create the ref
  const lang = i18next.language;
  const isRTL = lang === 'ar';
  const tArabic = i18next.getFixedT('ar'); // fixed translator for Arabic
 
  // when pressing the search button on the keyboard,this function is called
  const handleSubmitEditing = async () => {
    // Empty search: do nothing (stay on the category grid) instead of
    // rendering a blank results screen.
    if (!searchText || !searchText.trim()) {
      setShowFlatList(true);
      Keyboard.dismiss();
      return;
    }
    try {
      const results = await handleSearch(searchText); // calling the function of axios to fetch data
      onSearchResults(results, false,'search'); // sending the result from the search request back to home page
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
      onSearchResults([], true, 'category'); // Clear results and show main categories
    }
  };

  //This function sends the axios request to fetch data
  const handleSearch = async (searchKey) => {

    if (searchKey) {
      setShowFlatList(false);// Hide other flatList (cond. flatList)
      
      const response = await axios.get(url+'/GetCategory1BySearchKey', {
        params: { searchKey }
      });

      if (response && response.data && response.data.cat1TitlesList && response.data.cat1ItemsList) {
      
        const cat1TitlesList = response.data.cat1TitlesList;
        const cat1ItemsList = response.data.cat1ItemsList;
          
        return [
          { title: 'All', count: cat1ItemsList.length, categoryCode: 'AllCatOptions', searchText, ArabicTitle: tArabic('all')},
          ...cat1TitlesList.map((element) => {
            const cat1Code = element[0];
            const count = cat1ItemsList.reduce((acc, itemCatCode) => 
              itemCatCode[0] === cat1Code ? acc + 1 : acc, 0);
            return { title: element[1], count, categoryCode: cat1Code, searchText, ArabicTitle: element[2] };
          }),
        ];
      }
    }
    else {
      setShowFlatList(true);
    }
    return [];
  };

   // Function to clear the input if `searchText` is empty
   const clearInputIfEmpty = () => {
    if (searchText === '' && inputRef.current) {
        inputRef.current.clear(); // Clear the input visually
    }
};

useEffect(() => {
    clearInputIfEmpty(); // Call this function when `searchText` changes
}, [searchText]);

  return (
    <View style={[styles.searchBarContainer, isRTL && styles.searchBarRtl]}>
      <View style={[styles.field, isRTL && styles.fieldRtl]}>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={i18next.t('searchPlaceholder')}
          placeholderTextColor="#9AA0A6"
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          value={searchText}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={handleSubmitEditing}
          style={isRTL ? styles.searchIconRtl : styles.searchIconLtr}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  searchBarRtl: {
    flexDirection: 'row-reverse',
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#F4F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldRtl: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: 42,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  searchIconLtr: {
    marginLeft: 8,
  },
  searchIconRtl: {
    marginRight: 8,
  },
});

export default ItemSearch;
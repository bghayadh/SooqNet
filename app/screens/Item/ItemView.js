import React, { useState, useEffect,useRef } from 'react';
import { View, SafeAreaView, StyleSheet, Text, BackHandler,Keyboard,TouchableWithoutFeedback,TouchableOpacity } from 'react-native';
import ItemList from './ItemList';
import CategoryList from './CategoryList';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import ItemSearch from './ItemSearch';
import { useNavigation } from '@react-navigation/native';
import ItemFilter from './ItemFilter';
import CategoryPath from './CategoryPath';
import {ipAddress,port,webAppPath} from "@env";
import Navbar from '../../Navigations/Navbar';

function ItemView() {
    const { catCode,catTitle, source: initialSource, searchKey, savedFullCatCode: routeSavedFullCatCode,routeOrigin } = useLocalSearchParams();
    const [source, setSource] = useState(initialSource || 'category'); // Use 'category' as a default if no initial value 
    const [itemData, setItemData] = useState([]);
    const [catData, setCatData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullCatCode, setFullCatCode] = useState(catCode || ""); // Initialize with catCode
    const [lastCatLevel, setLastCatLevel] = useState(false); 
    const [showFlatList, setShowFlatList] = useState(true);
    const [searchResults, setSearchResults] = useState([]); 
    const [searchText, setSearchText] = useState(searchKey);
    const savedFullCatCode = useRef(source === 'search' && routeSavedFullCatCode ? routeSavedFullCatCode : fullCatCode);// Conditionally initialize savedFullCatCode with routeSavedFullCatCode if source is "search"
    const router = useRouter();
    const navigation = useNavigation();
    const [selectedSort, setSelectedSort] = useState(null); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sizeOptions, setSizeOptions] = useState([]); 
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [colorsOptions, setColorsOptions] = useState([]); 
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([0,500]);
    const [fullCatTitles, setFullCatTitles] = useState(catTitle);
    const [itemImagesPath, setItemImagesPath] = useState("");
    const [catImagesPath, setCatImagesPath] = useState("");
   

    useEffect(() => {//Set the value of previous cat before searching each time the searchKey change
      if (searchText === '' && savedFullCatCode.current) {
        setFullCatCode(savedFullCatCode.current);
      }
  }, [searchText]);


    useEffect(() => {
        const fetchData = async () => {
            if (!fullCatCode) return; // Prevent fetch if no category code

            try {
                setLoading(true);
                console.log("ipAddress "+ipAddress)
                const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/SooqNetGetCatItem', {
                  params: { catID: fullCatCode, source, searchKey },
                });

                // Handle item data
                setItemData(response?.data?.category1List || []);
                // Handle category data
                setCatData(response?.data?.subCategory1List || []);
                // Set lastCatLevel from server response
                setLastCatLevel(response?.data?.lastCatLevel || false);
             
                const itemImageBasePath = response?.data?.relativePath === "1"
                ? 'http://'+ipAddress+':'+port+webAppPath+response?.data?.itemImagesPath
                : 'http://'+ipAddress+':'+port+response?.data?.itemImagesPath;
                setItemImagesPath(itemImageBasePath);

                const catImageBasePath = response?.data?.relativePath === "1"
                ? 'http://'+ipAddress+':'+port+webAppPath+response?.data?.catImagesPath
                : 'http://'+ipAddress+':'+port+response?.data?.catImagesPath;
                setCatImagesPath(catImageBasePath);

                const sortedSizeOptions = sortSizes(response?.data?.sizeOptions || []);// Sort sizeOptions from smallest to largest
                setSizeOptions(sortedSizeOptions);            
                setColorsOptions(response?.data?.colorsOptions);

            } catch (error) {
                console.error("Error fetching data:", error.message);
                setItemData([]);
                setCatData([]); 
                setItemImagesPath("");
                setCatImagesPath("");
                setSizeOptions([]);
                setColorsOptions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fullCatCode, source, searchKey]); 

    // Function to handle category selection
    const handleCategoryPress = (newCatCode,newCatTitle) => {
      setSelectedSort(null);
      setSelectedSizes([]);
      setSelectedColors([]);
      setSelectedPriceRange([0,500]);
        const codes = fullCatCode.split('-');
        const titles = fullCatTitles.split('-');

        if (lastCatLevel && codes.length > 0) {
            // Replace the last category if lastCatLevel is true
            if (codes[codes.length - 1] === newCatCode) {
                // If the new category is the same as the last one, do nothing
                return;
            } else {
                // Replace the last category with the new category
                codes[codes.length - 1] = newCatCode;
            }
            if (titles[titles.length - 1] === newCatTitle) {
              // If the new category is the same as the last one, do nothing
              return;
          } else {
              // Replace the last category with the new category
              titles[titles.length - 1] = newCatTitle;
          }
        } else {
            // Combine with dash if not empty
            codes.push(newCatCode);
            titles.push(newCatTitle)
        }

        const combinedCatCode = codes.join('-'); // Join back into a single string
        const combinedCatTitle = titles.join('-'); // Join back into a single string
        setFullCatCode(combinedCatCode); // This will trigger the useEffect to fetch data
        setFullCatTitles(combinedCatTitle);
    };

    const handlePathPress = (newCatCode,newCatTitle) => {
      setFullCatCode(newCatCode);  // This updates the fullCatCode, triggering a re-fetch of data
      setFullCatTitles(newCatTitle);
    };

    // BackHandler to manage back button behavior
    useEffect(() => {
      const backAction = async () => {
        setSelectedSort(null);
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedPriceRange([0,500]);

        const codes = fullCatCode.split('-');
        const titles = fullCatTitles.split('-');
            if (codes.length > 1) {
                const updatedCatTitle = titles.slice(0, -1).join('-'); // Remove the last category Title
                setFullCatTitles(updatedCatTitle);

                const updatedCatCode = codes.slice(0, -1).join('-'); // Remove the last category code
                setFullCatCode(updatedCatCode);
                return true; 
            }
            else {
              if (source==='search' ) {
                try {
                  setLoading(true);
                  // Make an Axios request to refetch search results based on the searchKey
                  const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/GetCategory1BySearchKey', {
                      params: { searchKey },
                  });
  
                  // Process and set the search results, similar to handleSearch in ItemSearch
                  const cat1TitlesList = response.data.cat1TitlesList || [];
                  const cat1ItemsList = response.data.cat1ItemsList || [];
                  
                  const results = [
                      { title: 'All', count: cat1ItemsList.length, categoryCode: 'AllCatOptions', searchText: searchKey },
                      ...cat1TitlesList.map((element) => {
                          const cat1Code = element[0];
                          const count = cat1ItemsList.reduce((acc, itemCatCode) => 
                              itemCatCode[0] === cat1Code ? acc + 1 : acc, 0);
                          return { title: element[1], count, categoryCode: cat1Code, searchText: searchKey };
                      }),
                  ];
  
                  setSearchResults(results);
                  setShowFlatList(false); 
                  setLoading(false);
                  return true; // Indicate we handled the back action
  
              } catch (error) {
                  console.error("Error fetching search results:", error);
                  setLoading(false);
                  return false; // Let the back action continue if there's an error
              }
            }
            else {
              //navigation.navigate('screens/HomePage'); // Navigate to HomePage screen
              router.back();
            }            
            }
           // return false; 
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove(); // Clean up the event listener
    }, [fullCatCode,searchKey,source]);



    const handleSizeChange = (sizes) => {
      setSelectedSizes(sizes);  
      fetchItems(selectedSort,sizes,selectedColors,selectedPriceRange);
    };

    const handleRangeChange =(priceRange)  => {
      setSelectedPriceRange(priceRange);  
      fetchItems(selectedSort,selectedSizes,selectedColors,priceRange);
    };

    // Sorting function for sizeOptions
    const sortSizes = (sizes) => {
        
      // Separate numeric and alphabetic sizes
      const numericSizes = sizes.filter((size) => /^\d/.test(size));
      const alphabeticSizes = sizes.filter((size) => /^[a-zA-Z]/.test(size));

      if(numericSizes.length>0){
        numericSizes.sort((a, b) => {
            const [aMain, aSub] = a.split("/").map(Number);
            const [bMain, bSub] = b.split("/").map(Number);
            return aMain - bMain || (aSub || 0) - (bSub || 0);
        });
    }
      // Define custom order for alphabetic sizes
      const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
      alphabeticSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
 
     return [...alphabeticSizes, ...numericSizes];
      
    };

    const handleColorChange = (updatedColors) => {    
      setSelectedColors(updatedColors);
     fetchItems(selectedSort, selectedSizes, updatedColors,selectedPriceRange);
  
  };
    const fetchItems = async (sortOption,sizes = [],colors =[],price=[]) => {
      setLoading(true);
      setIsDropdownOpen(false); // Close the overlay when fetching items

      try {
        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/GetSooqNetFilteredItems', {
          params: {   
            sort: sortOption,
            catID: fullCatCode,
            sizes: sizes.join(','),
            colors: colors.join(','),
            price:price.join(','),
            source:source,
            searchKey:searchKey,
           },
      });      
      setItemData(response?.data?.category1List || []);
      const itemImageBasePath = response?.data?.relativePath === "1"
      ? 'http://'+ipAddress+':'+port+webAppPath+response?.data?.itemImagesPath
      : 'http://'+ipAddress+':'+port+response?.data?.itemImagesPath;
      setItemImagesPath(itemImageBasePath);

      const catImageBasePath = response?.data?.relativePath === "1"
      ? 'http://'+ipAddress+':'+port+webAppPath+response?.data?.catImagesPath
      : 'http://'+ipAddress+':'+port+response?.data?.catImagesPath;
      setCatImagesPath(catImageBasePath);

    } catch (error) {
          console.error("Error fetching items:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
    fetchItems(sortOption,selectedSizes,selectedColors,selectedPriceRange);
  };

 //Update the list of displayed items and toggles the visibility of main flatList before the search
 const handleSearchResults = (results, showCategories, sourceType) => {
  setShowFlatList(showCategories);
  setSearchResults(results);

  if (sourceType === 'category') {
      setSource('category');
      setSearchText(() => {
          return '';
      });
      setFullCatCode(savedFullCatCode.current); 

      if(routeOrigin ==='home') {
        navigation.navigate('screens/HomePage'); // Navigate to HomePage screen
      }
    }
  else  {
      savedFullCatCode.current = fullCatCode; // Save `fullCatCode` before search
  }
};
    return (
        <SafeAreaView style={styles.container}>
             <TouchableWithoutFeedback
          onPress={() => {
            if (searchText === '') {
              Keyboard.dismiss();
              setShowFlatList(true);
            }
          }}
          accessible={false} // Prevent accessibility conflicts
        >
          <View>
            <ItemSearch searchText={searchText} setSearchText={setSearchText} setShowFlatList={setShowFlatList} onSearchResults={handleSearchResults}
            />
          </View>
        </TouchableWithoutFeedback>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          showFlatList ? (
                <View style={styles.listContainer}>

                {isDropdownOpen && (
                    <TouchableWithoutFeedback >
                        <View style={styles.overlay} />
                    </TouchableWithoutFeedback>
                  )
                }
                    <CategoryList 
                        data={catData} 
                        catImagesPath={catImagesPath}
                        onCategoryPress={handleCategoryPress} 
                        lastCatLevel={lastCatLevel} 
                        selectedId={fullCatCode.split('-').pop()} 
                    />

                    <CategoryPath fullCatCode={fullCatCode}  fullCatTitle={fullCatTitles} categories={catData} onCategoryPress={handlePathPress} />
                    <Text></Text>
                    <View>
                      <ItemFilter
                        onSortChange={handleSortChange} selectedSort={selectedSort} onDropdownToggle={setIsDropdownOpen}
                        sizeOptions={sizeOptions} selectedSizes={selectedSizes}  onSizeChange={handleSizeChange}   colorsOptions={colorsOptions} selectedColors={selectedColors} onColorChange={handleColorChange} 
                         onRangeChange={handleRangeChange} selectedPriceRange={selectedPriceRange}    
                      />
                    </View>
                    <ItemList data={itemData} itemImagesPath={itemImagesPath} />
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
                      catTitle:result.title,
                      source: 'search',
                      searchKey: searchText,
                      savedFullCatCode: savedFullCatCode.current,
                      routeOrigin:'itemView'
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
         <Navbar activetab="" />
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
    overlay: {
      ...StyleSheet.absoluteFillObject, // Covers entire screen
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
      zIndex: 100, // Below `ItemFilter` but above other content
  },
      
});

export default ItemView;

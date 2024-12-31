import React, { useState, useEffect } from 'react';
import {FlatList,SafeAreaView,StatusBar,StyleSheet,Text,BackHandler, Dimensions,TouchableOpacity,ScrollView,View,Image,Keyboard,TouchableWithoutFeedback} from 'react-native';
import axios from 'axios';
import {useRouter} from 'expo-router';
import ItemSearch from './Item/ItemSearch';
import {ipAddress,port,webAppPath} from "@env";

const Category = ({ category,imageBasePath, onPress }) => (

  <TouchableOpacity onPress={onPress} style={[styles.cat, { backgroundColor:'white' }]}>
      <View style={styles.imageContainer} >
      <Image source={{ uri: imageBasePath+ category[2] }} style={styles.image} />
      </View>
      <Text style={styles.title} adjustsFontSizeToFit>
      {category[0]}
    </Text>
  </TouchableOpacity>
);


const HomePage = () => {
  const [selectedId, setSelectedId] = useState();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlatList, setShowFlatList] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]); 
  const [imageBasePath, setImageBasePath] = useState('');
  const router = useRouter();
  
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = 100 + 16; 
  const numColumns = Math.floor(screenWidth / itemWidth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/getCat1DetailsAndPaths'); 
        
        if (response?.data?.imageBasePathDetails) {
          const details = response.data.imageBasePathDetails;
          const [categoriesImagesPath, relPath] = details[0]; 
         
          const basePath =
          relPath === '1'
            ? 'http://' + ipAddress + ':' + port + webAppPath + categoriesImagesPath
            : 'http://' + ipAddress + ':' + port + categoriesImagesPath;
        
          setImageBasePath(basePath); 
        } 
        if (response && response.data && response.data.category1List) {
          setData(response.data.category1List);
        } 
        else {
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
    if (item.empty) {
      return <View style={{ flex: 1, margin: 8 }} />;
    }

    return (
      <Category
        category={item}
        imageBasePath={imageBasePath}
        onPress={() => {
          setSelectedId(item);
          router.push({ pathname: '/screens/Item/ItemView', params: { 
            catCode: item[1],
            catTitle: item[0],
            source: 'category',
           } });
        }}
      />
    );
  };
 const adjustedData = [...data];
  while (adjustedData.length % numColumns !== 0) {
    adjustedData.push({ empty: true });
  }

  useEffect(() => {
    const backAction = () => {
      if (searchText === '') {
        // If search is cleared, exit the app
        BackHandler.exitApp();
        return true;
      }
      // Otherwise, allow the default back behavior
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    // Clean up the event listener
    return () => backHandler.remove();
  }, [searchText]);


 //Update the list of displayed items and toggles the visibility of main flatList before the search
  const handleSearchResults = (results, showCategoriesState,sourceType) => {
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
    <ItemSearch searchText={searchText}  setSearchText={setSearchText} setShowFlatList={setShowFlatList} onSearchResults={handleSearchResults} />
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          showFlatList ? (
            <FlatList
                data={adjustedData}
                renderItem={renderCategory}
                keyExtractor={(item, index) => index.toString()}
                numColumns={numColumns}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                }}
                contentContainerStyle={{
                  top:'25%'
                }}
          />
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
                     routeOrigin:'home',
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
    //marginTop: StatusBar.currentHeight || 0,
    backgroundColor:"#ffff",
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
    flex: 1,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: 100,
    marginTop: 5,
    height: 36, 
  },
  centeredContainer: {
    flex: 1,
    position: 'absolute',
    top: '30%',
    backgroundColor: 'white',
  },
  imageContainer: {
    width: 70,
    aspectRatio: 1,              
    borderRadius: 45,         
    overflow: 'hidden',       
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',   

  },
  image: {
    width: '100%', 
    height: '100%',
    resizeMode:'contain',
  },
});

export default HomePage;

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  BackHandler,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import ItemSearch from "./Item/ItemSearch";
import { ipAddress, port, webAppPath, url } from "@env";
import Navbar from "../Navigations/Navbar";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook
import i18next from "i18next";
import KeyboardScreen, {
  useKeyboardVisible,
} from "../Components/KeyboardScreen";

const Category = ({ category, imageBasePath, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.cat, { backgroundColor: "white" }]}
  >
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: imageBasePath + category[2] }}
        style={styles.image}
      />
    </View>
    <Text style={styles.title} adjustsFontSizeToFit>
      {i18next.language === "en" ? category[0] : category[4]}
    </Text>
  </TouchableOpacity>
);

const HomePage = () => {
  const keyboardVisible = useKeyboardVisible();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlatList, setShowFlatList] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [imageBasePath, setImageBasePath] = useState("");
  const router = useRouter();
  const { t, i18n } = useTranslation(); // Access translation function
  const currentLang = i18next.language;

  const screenWidth = Dimensions.get("window").width;
  const itemWidth = 100 + 16;
  const numColumns = Math.floor(screenWidth / itemWidth);

  console.log("ENV URL:", url);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url + "/getCat1DetailsAndPaths");

        if (response?.data?.imageBasePathDetails) {
          const details = response.data.imageBasePathDetails;
          const [categoriesImagesPath, relPath] = details[0];

          const basePath =
            relPath === "1"
              ? url + categoriesImagesPath
              : "https://" + ipAddress + ":" + port + categoriesImagesPath;

          setImageBasePath(basePath);
        }
        if (response && response.data && response.data.category1List) {
          setData(response.data.category1List);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error(
          "There was an error while trying to get C1 categories in the home screen!",
          error.message,
        );
        console.log("AXIOS ERROR:", error.message);
        console.log("RESPONSE:", error?.response?.data || "No response");
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
          router.push({
            pathname: "/screens/Item/ItemView",
            params: {
              catCode: item[1],
              catTitle: item[0],
              arabicCatTitle: item[4],
              source: "category",
            },
          });
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
      if (searchText === "") {
        // If search is cleared, exit the app
        BackHandler.exitApp();
        return true;
      }
      // Otherwise, allow the default back behavior
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    // Clean up the event listener
    return () => backHandler.remove();
  }, [searchText]);

  //Update the list of displayed items and toggles the visibility of main flatList before the search
  const handleSearchResults = (results, showCategoriesState, sourceType) => {
    setShowFlatList(showCategoriesState);
    setSearchResults(results);
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (searchText === "") {
          Keyboard.dismiss(); // Dismiss the keyboard if searchText is empty
          setShowFlatList(true);
        }
      }}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ItemSearch
          searchText={searchText}
          setSearchText={setSearchText}
          setShowFlatList={setShowFlatList}
          onSearchResults={handleSearchResults}
        />
        <KeyboardScreen>
          {loading ? (
            <Text>{t("loadingText")}</Text>
          ) : showFlatList ? (
            <FlatList
              data={adjustedData}
              renderItem={renderCategory}
              keyExtractor={(item, index) => index.toString()}
              numColumns={numColumns}
              keyboardShouldPersistTaps="handled"
              columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: 16,
                flexDirection:
                  i18next.language === "ar" ? "row-reverse" : "row", // Handle RTL layout
              }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                paddingBottom: keyboardVisible ? 16 : 72 + insets.bottom,
              }}
            />
          ) : (
            <ScrollView
              style={styles.resultsContainer}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: keyboardVisible ? 16 : 72 + insets.bottom,
              }}
            >
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => {
                    router.push({
                      pathname: "/screens/Item/ItemView",
                      params: {
                        catCode: result.categoryCode,
                        catTitle: result.title,
                        arabicCatTitle: result.ArabicTitle,
                        source: "search",
                        searchKey: searchText,
                        routeOrigin: "home",
                      },
                    });
                  }}
                >
                  <Text style={styles.resultText}>
                    {i18next.language === "en"
                      ? result.title
                      : result.ArabicTitle}
                  </Text>
                  <Text style={styles.resultCount}>{result.count}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </KeyboardScreen>
        {!keyboardVisible && <Navbar activetab="home" />}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
    backgroundColor: "#ffff",
  },
  resultsContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultText: {
    fontSize: 16,
    color: "black",
  },
  resultCount: {
    fontSize: 16,
    color: "gray",
  },
  cat: {
    flex: 1,
    margin: 8,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 14,
    textAlign: "center",
    flexShrink: 1,
    maxWidth: 100,
    marginTop: 5,
    height: 36,
  },
  centeredContainer: {
    flex: 1,
    position: "absolute",
    top: "30%",
    backgroundColor: "white",
  },
  imageContainer: {
    width: 70,
    aspectRatio: 1,
    borderRadius: 45,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default HomePage;

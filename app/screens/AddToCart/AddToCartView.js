import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import ItemImages from "./ItemImages";
import ItemDetailsComponent from "./ItemDetailsComponent";
import { useLocalSearchParams } from "expo-router";
import { ipAddress, port, webAppPath, url } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../../Navigations/Navbar";
import i18next from "i18next";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook
import Dialog from "react-native-dialog";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandler } from "react-native-gesture-handler";
import ItemVideo from "./ItemVideo";
import KeyboardScreen, {
  useKeyboardVisible,
} from "../../Components/KeyboardScreen";

const onAddCartPress = async (
  itemCode,
  itemData,
  colorID,
  colorName,
  itemSize,
  imagePath,
  imageName,
  t,
  arabicColorName,
  noSize,
  noSizeNoColor,
  noQuantityCheck,
  wholesaleTiers,
  quantity,
  setDialogVisible,
  setMsg,
) => {
  // Validate itemSize to make sure it's not null or empty
  console.log("Welcome to onAddCartPress");
  console.log(
    "itemSize is ",
    itemSize + " noSize is ",
    noSize + " noSizeNoColor is ",
    noSizeNoColor,
  );
  console.log("colorID is ", colorID);
  if ((!itemSize || itemSize === "") && noSize != 1 && noSizeNoColor != 1) {
    // Display an alert or message
    console.log(
      "Inside the if statement itemSize is ",
      itemSize + " noSize is ",
      noSize + " noSizeNoColor is ",
      noSizeNoColor,
    );
    const msg = t("addToCartAlert");
    alert(msg);
    return; // Stop further execution
  }

  if (noSizeNoColor == 1) {
    colorID = "";
    colorName = "";
  }
  try {
    const response = await axios.get(url + "/GetItemAvailableQtySooqNet", {
      params: { itemCode: itemCode, color: colorName, size: itemSize },
    });

    const availableQty = response.data?.itemAvailableQty;
    // console.log("availableQty "+availableQty)
    // Check if item is available; this need to be updated
    //  if quantity field added  to addToCart view so compare availableQty with typed quantity by user
    if (availableQty < quantity && noQuantityCheck != 1) {
      alert(t("itemOutOfStock")); // Add this translation key to your i18n files
      return;
    }
  } catch (error) {
    console.error("Error fetching available quantity: ", error);
    // alert(t('qtyCheckError')); // Optional: Add this message too
    return;
  }

  // Generate unique ID for the item based on itemCode, colorID, and itemSize
  const ID = itemCode + "_" + colorID + "_" + itemSize;
  const quentity = quantity;
  const itemName = itemData[0][1];
  const arabicItemName = itemData[0][6];
  const rate = itemData[0][2];
  const discount = itemData[0][3];

  // Create the cart item object
  const cartItem = {
    ID,
    itemCode,
    colorID,
    colorName,
    itemSize,
    imagePath,
    imageName,
    itemName,
    rate,
    discount,
    quentity,
    arabicColorName,
    arabicItemName,
    wholesaleTiers,
  };

  try {
    // Get the existing cart data from AsyncStorage
    const existingCartData = await AsyncStorage.getItem("cartData");

    // Initialize cartArray as an empty array if no data exists
    let cartArray = existingCartData ? JSON.parse(existingCartData) : [];

    // Make sure cartArray is an array
    if (!Array.isArray(cartArray)) {
      cartArray = [];
    }

    // Check if the item already exists in the cart based on the ID
    const existingItemIndex = cartArray.findIndex((item) => item.ID === ID);

    if (existingItemIndex !== -1) {
      // Item already exists in the cart, so increment its quantity
      cartArray[existingItemIndex].quentity += quantity;
      cartArray[existingItemIndex].wholesaleTiers = wholesaleTiers;
    } else {
      // Item does not exist, so add it to the cart with quantity 1
      cartArray.push(cartItem);
    }

    // Save the updated cartArray back to AsyncStorage
    await AsyncStorage.setItem("cartData", JSON.stringify(cartArray));
    console.log("noSizeNoColor is ", noSizeNoColor);
    if (noSizeNoColor == 1) {
      setMsg("itemAddedToBasketNoColorNoSize");
      setDialogVisible(true);
      //alert(t('itemAddedToBasketNoColorNoSize'));
    } else if (noSize == 1) {
      setMsg("itemAddedToBasketNoSize");
      setDialogVisible(true);
      //alert(t('itemAddedToBasketNoSize'));
    } else {
      console.log("Successfully Added.");
      setMsg("itemAddedToBasket");
      setDialogVisible(true);
      //alert(t('itemAddedToBasket'));
    }
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

const AddToCartView = () => {
  const keyboardVisible = useKeyboardVisible();
  const { itemCode } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [itemData, setItemData] = useState([]);
  const [itemImage, setItemImage] = useState([]);
  const [itemColors, setItemColors] = useState([]);
  const [itemSizes, setItemSizes] = useState([]);
  const [itemColorsImage, setItemColorsImage] = useState([]);
  const [wholesaleTiers, setWholesaleTiers] = useState([]);
  const [itemVideos, setItemVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false); // State to track if image is in full-screen mode
  const [selectedColorID, setSelectedColorID] = useState(null); // State for selected color ID
  const [selectedColorName, setSelectedColorName] = useState("");
  const [selectedColorArabicName, setSelectedColorArabicName] = useState("");
  const [itemImageBasePath, setItemImageBasePath] = useState("");
  const [colorImageBasePath, setColorImageBasePath] = useState("");
  const [selectedItemSize, setSelectedItemSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const { t, i18n } = useTranslation();
  const [noSizeNoColor, setNoSizeNoColor] = useState([]);
  const [noSize, setNoSize] = useState([]);
  const [noQuantityCheck, setNoQuantityCheck] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [msg, setMsg] = useState("");

  /*  
  const MemoizedItemImages = React.memo(ItemImages);
const MemoizedItemDetailsComponent = React.memo(ItemDetailsComponent); */

  const lang = i18next.language;
  const isRTL = lang === "ar"; //

  const scrollY = useRef(new Animated.Value(0)).current; // Track scroll position
  const screenHeight = Dimensions.get("window").height; // Get screen height to calculate dynamic sizes
  const IMAGE_MAX_HEIGHT = screenHeight * 0.7;

  useEffect(() => {
    const fetchData = async () => {
      if (!itemCode) return;

      setLoading(true);
      setSelectedQuantity("1");

      try {
        // console.log("ipAddress "+ipAddress)
        const response = await axios.get(url + "/GetItemDetails", {
          params: { itemCode: itemCode },
        });

        const {
          itemDescList,
          itemImageList,
          itemColorsList,
          itemSizeTypeList,
          itemColorImages,
          wholesaleTiers: tiers,
          itemVideos: videos,
        } = response?.data || {};
        console.log("itemDescList is: ", itemDescList);
        setItemData(itemDescList || []);
        console.log("itemDescList[0][8] is: ", itemDescList[0][8]);
        console.log("itemImageList is: ", itemImageList);
        console.log("itemImageList length is: ", itemImageList.length);
        setItemImage(itemImageList || []);
        console.log("item");
        console.log("itemImage is ", itemImage);
        console.log("itemColorsList is: ", itemColorsList);
        setItemColors(itemColorsList || []);
        console.log("itemSizeTypeList is: ", itemSizeTypeList);
        setItemSizes(itemSizeTypeList || []);
        console.log("itemColorImages is: ", itemColorImages);
        setItemColorsImage(itemColorImages || []);
        setWholesaleTiers(tiers || []);
        setItemVideos(videos || []);
        console.log(
          "itemColorsList[0][2] is: ",
          itemColorsList[0]?.[2] ?? null,
        );
        setSelectedColorID(itemColorsList[0]?.[2] ?? null); // Set the first color as the default selected color
        setSelectedColorName(itemColorsList[0]?.[3] ?? null);
        setSelectedColorArabicName(itemColorsList[0]?.[4] ?? null);
        setNoSizeNoColor(itemDescList[0]?.[8] ?? null);
        setNoSize(itemDescList[0]?.[9] ?? null);
        setNoQuantityCheck(itemDescList[0]?.[10] ?? null);

        if (response?.data?.imageBasePathDetails) {
          const details = response.data.imageBasePathDetails;
          const [itemImagesPath, colorImagesPath, relPath] = details[0];

          const itemImagePath =
            relPath === "1"
              ? url + itemImagesPath
              : "https://" + ipAddress + ":" + port + itemImagesPath;
          console.log("itemImagePath is ", itemImagePath);
          setItemImageBasePath(itemImagePath);

          const colorImagePath =
            relPath === "1"
              ? url + colorImagesPath
              : "https://" + ipAddress + ":" + port + colorImagesPath;
          console.log("colorImagePath is ", colorImagePath);
          setColorImageBasePath(colorImagePath);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setItemData([]);
        setItemImage([]);
        setItemColors([]);
        setItemSizes([]);
        setItemColorsImage([]);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [itemCode]);

  const scrollRef = useRef(null);
  const quantityY = useRef(0);

  useEffect(() => {
    if (!keyboardVisible) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, quantityY.current - 24),
        animated: true,
      });
    }, 100);
    return () => clearTimeout(id);
  }, [keyboardVisible]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <Navbar activetab="" />
      </View>
    );
  }

  // Adjusting height of ItemImages based on scroll position
  const imageHeight = scrollY.interpolate({
    inputRange: [0, screenHeight * 0.7], // Start shrinking at 70% of the screen height
    outputRange: [screenHeight * 0.7, 0], // Shrink from 70% to 0 height
    extrapolate: "clamp",
  });

  const quantityNumber = Math.max(1, parseInt(selectedQuantity, 10) || 1);
  const retailUnitPrice =
    Number(itemData[0]?.[2] || 0) * (1 - Number(itemData[0]?.[3] || 0) / 100);
  const selectedWholesaleTier = wholesaleTiers.find(
    ({ minQuantity, maxQuantity }) =>
      quantityNumber >= Number(minQuantity) &&
      (maxQuantity == null || quantityNumber <= Number(maxQuantity)),
  );
  const selectedUnitPrice =
    retailUnitPrice *
    (1 - Number(selectedWholesaleTier?.discountPercent || 0) / 100);

  const handleScrollBegin = () => {
    setIsScrolling(true); // Set scrolling state to true when scroll starts
  };

  const handleScrollEnd = () => {
    setIsScrolling(false); // Set scrolling state to false when scroll ends
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.carouselContainer,
          { height: imageHeight },
          {
            zIndex: isScrolling ? 0 : 1,
            pointerEvents: isScrolling ? "none" : "auto",
          },
        ]}
      >
        <ItemImages
          imageData={
            itemData[0][8] === "0" && itemColorsImage.length > 0
              ? Array.isArray(itemColorsImage[selectedColorID])
                ? itemColorsImage[selectedColorID]
                : []
              : Array.isArray(itemImage)
                ? itemImage
                : []
          }
          onFullScreenToggle={setIsFullScreen}
          itemImagePath={itemImageBasePath}
          imageHeight={imageHeight}
          isRTL={isRTL}
        />
      </Animated.View>

      <KeyboardScreen style={{ pointerEvents: "box-none" }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.detailsContainer,
            {
              paddingTop: IMAGE_MAX_HEIGHT,
              paddingBottom: keyboardVisible ? 16 : 58 + insets.bottom,
            },
          ]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          onScrollBeginDrag={handleScrollBegin} // Start scrolling event
          onScrollEndDrag={handleScrollEnd} // End scrolling event
          style={{ pointerEvents: "auto" }}
        >
          {!isFullScreen && (
            <ItemDetailsComponent
              itemData={itemData}
              itemColors={itemColors}
              itemSizes={itemSizes[selectedColorID]}
              selectedColorID={selectedColorID}
              setSelectedColorID={setSelectedColorID}
              colorImagePath={colorImageBasePath}
              selectedColorName={selectedColorName}
              setSelectedColorName={setSelectedColorName}
              selectedColorArabicName={selectedColorArabicName}
              setSelectedColorArabicName={setSelectedColorArabicName}
              setSelectedItemSize={setSelectedItemSize}
              isRTL={isRTL}
              wholesaleTiers={wholesaleTiers}
            />
          )}

          {!isFullScreen && (
            <View
              style={styles.quantitySection}
              onLayout={(e) => {
                quantityY.current = e.nativeEvent.layout.y;
              }}
            >
              <Text
                style={[
                  styles.quantityLabel,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("quantity")}
              </Text>
              <View
                style={[
                  styles.quantityControls,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("decreaseQuantity")}
                  style={styles.quantityButton}
                  onPress={() =>
                    setSelectedQuantity(String(Math.max(1, quantityNumber - 1)))
                  }
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  accessibilityLabel={t("quantity")}
                  style={styles.quantityInput}
                  value={selectedQuantity}
                  onChangeText={(value) =>
                    setSelectedQuantity(value.replace(/[^0-9]/g, ""))
                  }
                  onBlur={() => setSelectedQuantity(String(quantityNumber))}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("increaseQuantity")}
                  style={styles.quantityButton}
                  onPress={() =>
                    setSelectedQuantity(String(quantityNumber + 1))
                  }
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.selectedUnitPrice,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("unitPrice")}: ${selectedUnitPrice.toFixed(2)}
              </Text>
            </View>
          )}

          {!isFullScreen && (
            <ItemVideo
              videos={itemVideos}
              isRTL={isRTL}
              basePath={itemImageBasePath}
            />
          )}

          {!isFullScreen && (
            <View style={{ pointerEvents: "auto" }}>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => {
                  const imageName =
                    itemColorsImage?.[selectedColorID]?.[0]?.IMAGE_NAME ||
                    (Array.isArray(itemImage)
                      ? itemImage?.[0]?.IMAGE_NAME
                      : null);
                  onAddCartPress(
                    itemCode,
                    itemData,
                    selectedColorID,
                    selectedColorName,
                    selectedItemSize,
                    itemImageBasePath,
                    imageName,
                    //itemColorsImage[selectedColorID][0].IMAGE_NAME,
                    t,
                    selectedColorArabicName,
                    noSize,
                    noSizeNoColor,
                    noQuantityCheck,
                    wholesaleTiers,
                    quantityNumber,
                    setDialogVisible,
                    setMsg,
                  );
                }}
              >
                <Text style={styles.addToCartText}>{t("Add to Cart")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>"Success"</Dialog.Title>
          <Dialog.Description>{t(msg)}</Dialog.Description>
          <Dialog.Button label="OK" onPress={() => setDialogVisible(false)} />
        </Dialog.Container>
      </KeyboardScreen>
      {!keyboardVisible && <Navbar activetab="" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  carouselContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  detailsContainer: {
    paddingTop: 0,
  },
  addToCartButtonContainer: {
    marginBottom: 20, // No extra space at the bottom
  },
  addToCartButton: {
    backgroundColor: "black", // Button color
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 20, // Optional: Add horizontal margin for button spacing
    marginBottom: 20,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantitySection: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f7f8fa",
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  quantityControls: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  quantityButton: {
    minWidth: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: { fontSize: 22, fontWeight: "600", color: "#111" },
  quantityInput: {
    width: 56,
    height: 42,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    color: "#111",
  },
  selectedUnitPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#00757c",
  },
});

export default AddToCartView;

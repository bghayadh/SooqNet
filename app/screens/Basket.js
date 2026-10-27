import React, { useState, useEffect, useRef } from "react";
import {
  VirtualizedList,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import Navbar from "../Navigations/Navbar";
import { useRouter } from "expo-router";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { ipAddress, port, webAppPath, url } from "@env";
import KeyboardScreen, {
  useKeyboardVisible,
} from "../Components/KeyboardScreen";

const Basket = () => {
  const keyboardVisible = useKeyboardVisible();
  const [basketData, setBasketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  // Synchronous guard: state updates are async, so a rapid double tap could
  // still fire two requests before `checkingOut` becomes true.
  const checkoutInFlight = useRef(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const lang = i18next.language;
  const isRTL = lang === "ar";

  const getWholesaleDiscount = (item) => {
    const tier = (item.wholesaleTiers || []).find(
      ({ minQuantity, maxQuantity }) =>
        item.quentity >= minQuantity &&
        (maxQuantity == null || item.quentity <= maxQuantity),
    );
    return Number(tier?.discountPercent || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedCartData = await AsyncStorage.getItem("cartData");
        if (storedCartData) {
          setBasketData(JSON.parse(storedCartData));
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to update the quantity of an item
  const updateQuantity = async (ID, increment) => {
    try {
      const storedCartData = await AsyncStorage.getItem("cartData");
      let cartArray = storedCartData ? JSON.parse(storedCartData) : [];

      // Find the item in the cart
      const itemIndex = cartArray.findIndex((item) => item.ID === ID);

      if (itemIndex !== -1) {
        // Update the quantity
        const newQuantity = cartArray[itemIndex].quentity + increment;
        cartArray[itemIndex].quentity = newQuantity > 0 ? newQuantity : 1; // Avoid negative quantities
      }

      // Save the updated cart data to AsyncStorage
      await AsyncStorage.setItem("cartData", JSON.stringify(cartArray));

      // Update the state to re-render the component
      setBasketData(cartArray);
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  };

  const updateQuantityInput = async (ID, value) => {
    try {
      if (!/^\d+$/.test(value)) return;
      const newQuantity = Math.max(1, parseInt(value, 10));
      const storedCartData = await AsyncStorage.getItem("cartData");
      let cartArray = storedCartData ? JSON.parse(storedCartData) : [];

      // Find the item in the cart
      const itemIndex = cartArray.findIndex((item) => item.ID === ID);

      if (itemIndex !== -1) {
        // Update the quantity
        cartArray[itemIndex].quentity = newQuantity;
      }

      // Save the updated cart data to AsyncStorage
      await AsyncStorage.setItem("cartData", JSON.stringify(cartArray));

      // Update the state to re-render the component
      setBasketData(cartArray);
    } catch (error) {
      console.error("Error updating quantity input: ", error);
    }
  };

  const handleBlur = async (ID, value) => {
    try {
      if (value === "" || value == 0) {
        value = 1;
      }
      updateQuantityInput(ID, value);
    } catch (error) {
      console.error("Error handling blur: ", error);
    }
  };

  // Function to remove an item from the cart
  const removeCartItem = async (ID) => {
    try {
      const storedCartData = await AsyncStorage.getItem("cartData");

      if (!storedCartData) {
        return;
      }

      let cartArray = JSON.parse(storedCartData);

      cartArray = cartArray.filter((item) => item.ID !== ID);

      await AsyncStorage.setItem("cartData", JSON.stringify(cartArray));

      setBasketData(cartArray);
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const handleCheckoutPress = async () => {
    if (checkoutInFlight.current) {
      return;
    }

    if (basketData.length === 0) {
      // Show an alert if the basket is empty
      alert(
        "Your basket is empty. Add some items before proceeding to checkout.",
      );
      return;
    }

    checkoutInFlight.current = true;
    setCheckingOut(true);

    try {
      const storedLoginDetails = await AsyncStorage.getItem("loginDetails");

      const response = await axios.post(
        url + "/GetAllItemAvailableQtySooqNet",
        {
          dictParameter: basketData.map(
            ({
              itemCode,
              colorName,
              itemSize,
              itemName,
              arabicItemName,
            }) => ({
              itemCode,
              colorName,
              itemSize,
              itemName,
              arabicItemName,
            }),
          ),
        },
      );

      const qtyItemList = response.data?.qtyItemList;
      const status = response.data?.Status;

      // The server may answer with HTTP 200 but no qtyItemList (for example
      // when the database call failed), so never assume the array exists.
      if (
        status === "Failed" ||
        status === "NoSession" ||
        !Array.isArray(qtyItemList)
      ) {
        console.error("Invalid availability response: ", response.data);
        alert(t("qtyCheckError"));
        return;
      }

      let Flag = "";
      for (let i = 0; i < basketData.length; i++) {
        const basketItem = basketData[i];

        // Find the matching entry in qtyItemList by itemCode
        const matchedRow = qtyItemList.find(
          (row) => row && row[1] === basketItem.itemCode,
        );

        if (matchedRow) {
          if (parseInt(basketItem.quentity) > parseInt(matchedRow[0])) {
            if (isRTL) {
              alert(matchedRow[3] + t("itemOutOfStock"));
            } else {
              alert(matchedRow[2] + t("itemOutOfStock"));
            }
            Flag = "cantProceed";
            break;
          }
        }
      }

      if (Flag != "cantProceed") {
        if (storedLoginDetails) {
          const userData = JSON.parse(storedLoginDetails);
          if (userData.isLoggedIn === "true") {
            // console.log("login identifier "+userData.loginIdentifier)
            router.push("/screens/Checkout/GuestPersonalInfo");
          }
        } else {
          console.log("Not logged in or nothing stored in local storage");
          router.push("/screens/Checkout/CheckoutLogin");
        }
      }
    } catch (error) {
      console.error("Error fetching available quantity: ", error);
      alert(t("qtyCheckError"));
    } finally {
      checkoutInFlight.current = false;
      setCheckingOut(false);
    }
  };

  const renderItem = ({ item }) => {
    const imagePath = item.imagePath + item.imageName;

    const retailDiscount = Number(item.discount || 0);
    const wholesaleDiscount = getWholesaleDiscount(item);
    const discount =
      100 * (1 - (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100));
    const finalPrice =
      item.rate * (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100);
    const lineTotal = finalPrice * Number(item.quentity || 0);

    return (
      <View style={styles.itemContainer}>
        <View
          style={[styles.itemRow, isRTL && { flexDirection: "row-reverse" }]}
        >
          <Image source={{ uri: imagePath }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text
              style={[styles.itemName, { textAlign: isRTL ? "right" : "left" }]}
            >
              {isRTL ? item.arabicItemName : item.itemName}
            </Text>

            <View
              style={[
                styles.colorSizeRow,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <Text>{isRTL ? item.arabicColorName : item.colorName}</Text>
              {item.itemSize ? <Text>/</Text> : null}
              <Text>{item.itemSize}</Text>
            </View>

            <View style={styles.priceColumn}>
              {discount > 0 ? (
                <>
                  <Text
                    style={[
                      styles.originalPrice,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {isRTL ? `${item.rate} $` : `$${item.rate}`}
                  </Text>
                  <Text
                    style={[
                      styles.discount,
                      { alignSelf: isRTL ? "flex-end" : "flex-start" },
                    ]}
                  >
                    -{discount.toFixed(0)}%
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.originalPrice,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {isRTL ? `${item.rate} $` : `$${item.rate}`}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.unitPrice,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("unitPrice")}:{" "}
              {isRTL
                ? `${finalPrice.toFixed(2)} $`
                : `$${finalPrice.toFixed(2)}`}
            </Text>
            <Text
              style={[
                styles.lineTotal,
                { textAlign: isRTL ? "right" : "left" },
              ]}
            >
              {t("itemTotal")}:{" "}
              {isRTL ? `${lineTotal.toFixed(2)} $` : `$${lineTotal.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityMinusButton}
              onPress={() => updateQuantity(item.ID, -1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.quantityTextInput}
              value={String(item.quentity)}
              keyboardType="numeric"
              onChangeText={(text) => updateQuantityInput(item.ID, text)}
              onBlur={(e) => handleBlur(item.ID, item.quentity)}
            />

            <TouchableOpacity
              style={styles.quantityPlusButton}
              onPress={() => updateQuantity(item.ID, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => removeCartItem(item.ID)}
          >
            <MaterialIcons name="delete" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const basketTotal = basketData.reduce((sum, item) => {
    const retailDiscount = Number(item.discount || 0);
    const wholesaleDiscount = getWholesaleDiscount(item);
    const unitPrice =
      Number(item.rate || 0) *
      (1 - retailDiscount / 100) *
      (1 - wholesaleDiscount / 100);
    return sum + unitPrice * Number(item.quentity || 0);
  }, 0);

  const renderBasketTotal = () => (
    <View
      style={[
        styles.basketTotalContainer,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
    >
      <Text style={styles.basketTotalLabel}>{t("basketTotal")}</Text>
      <Text style={styles.basketTotalValue}>
        {isRTL ? `${basketTotal.toFixed(2)} $` : `$${basketTotal.toFixed(2)}`}
      </Text>
    </View>
  );

  const getItemCount = () => {
    return basketData.length;
  };

  const getItem = (data, index) => {
    return data[index];
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardScreen>
        <View
          style={[
            styles.header,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <MaterialIcons
            name="shopping-cart"
            size={24}
            color="#000"
            style={styles.icon}
          />
          <Text
            style={[
              styles.headerTitle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
          >
            {t("basket")}
          </Text>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              checkingOut && styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckoutPress}
            disabled={checkingOut}
          >
            <Text style={styles.checkoutButtonText}>
              {checkingOut ? t("loadingText") : t("checkout")}
            </Text>
          </TouchableOpacity>
        </View>

        <VirtualizedList
          style={{ marginBottom: keyboardVisible ? 0 : 40 }}
          contentContainerStyle={{
            paddingBottom: keyboardVisible ? 16 : 72 + insets.bottom,
          }}
          data={basketData}
          initialNumToRender={10}
          renderItem={renderItem}
          keyExtractor={(item) => item.ID.toString()}
          getItemCount={getItemCount}
          getItem={getItem}
          ListFooterComponent={basketData.length > 0 ? renderBasketTotal : null}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        />
      </KeyboardScreen>
      {!keyboardVisible && <Navbar activetab="basket" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "column",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemImage: {
    width: 80,
    height: 80,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 5,
    resizeMode: "contain",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceColumn: { alignItems: "flex-start", marginTop: 2 },
  originalPrice: {
    fontSize: 14,
    color: "#000",
    marginLeft: 5,
    marginRight: 5,
  },
  discount: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#fff1f2",
    color: "#c62828",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  lineTotal: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#00757c",
  },
  unitPrice: { marginTop: 2, fontSize: 13, color: "#555" },
  basketTotalContainer: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f0f7f7",
    justifyContent: "space-between",
    alignItems: "center",
  },
  basketTotalLabel: { fontSize: 16, fontWeight: "700", color: "#222" },
  basketTotalValue: { fontSize: 18, fontWeight: "700", color: "#00757c" },
  colorName: {
    fontSize: 14,
    color: "gray",
  },
  removeIcon: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSizeRow: {
    //flexDirection: 'row',
    marginVertical: 5,
    flexWrap: "wrap",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  quantityMinusButton: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  quantityPlusButton: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  quantityTextInput: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  checkoutButton: {
    padding: 5,
    backgroundColor: "#000",
    borderRadius: 5,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Basket;

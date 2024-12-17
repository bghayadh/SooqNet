import React, { useState, useRef, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Item Component
const Item = React.memo(({ item, itemImagesPath, textColor }) => {
  const validImages = item.imageData.filter(img => img.name !== null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const itemCode = item.itemCode || 'unknown';

  const renderImage = ({ item }) => (
    <View style={styles.slide}>
      {/* Make image clickable for navigation */}
      <TouchableWithoutFeedback
        onPress={() => {
          // Navigate to AddToCart screen when image is clicked
          router.push({
            pathname: '/screens/AddToCart/AddToCartView',
            params: { itemCode },
          });
        }}
      >
        <Image
          source={{ uri: itemImagesPath + item.name }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableWithoutFeedback>
    </View>
  );

  const calculateDiscountedPrice = (oldPrice, discount) => {
    if (oldPrice && discount) {
      const discountAmount = (oldPrice * discount) / 100;
      return oldPrice - discountAmount;
    }
    return oldPrice;
  };

  const oldPrice = parseFloat(item.itemPriceStr.replace(/[^0-9.-]+/g, ""));
  const discount = item.itemDiscount;
  const newPrice = calculateDiscountedPrice(oldPrice, discount);

  return (
    <View style={styles.item}>
      <View style={styles.swiperContainer}>
        {validImages.length > 0 ? (
          <AnimatedFlatList
            horizontal
            data={validImages}
            renderItem={renderImage}
            keyExtractor={(item, index) => `item.name-${index}`}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(
                event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
              );
              setCurrentIndex(index);
            }}
            snapToAlignment="center"
            decelerationRate={0.4}
            snapToInterval={screenWidth / 2 - 4}  // Adjust this based on your image width (50% of screen width)
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={[styles.noImageText, { color: textColor }]}>No image found</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.textContainer}
        onPress={() => {
          // Navigate to AddToCart screen when description is clicked
          router.push({
            pathname: '/screens/AddToCart/AddToCartView',
            params: { itemCode },
          });
        }}
      >
        <Text numberOfLines={1} style={[styles.title, { color: textColor, marginLeft: 2 }]}>
          {item.itemDescription ? item.itemDescription : item.itemName}
        </Text>

        <View style={styles.priceContainer}>
          {discount ? (
            <>
              <Text
                style={[styles.title, { color: textColor, textDecorationLine: 'line-through', marginLeft: 2 }]}
              >
                {oldPrice ? `$${oldPrice.toFixed(2)}` : 'N/A'}
              </Text>

              <View style={styles.discountContainer}>
                <Text style={[styles.title, { color: textColor, marginHorizontal: 2 }]}>
                  {`- ${discount}%`}
                </Text>
              </View>

              <Text style={[styles.title, { color: textColor, marginLeft: 5 }]}>
                {newPrice ? `$${newPrice.toFixed(2)}` : 'N/A'}
              </Text>
            </>
          ) : (
            <Text style={[styles.title, { color: textColor, marginLeft: 2 }]}>
              {oldPrice ? `$${oldPrice.toFixed(2)}` : 'N/A'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

// ItemList Component
const ItemList = ({ data, itemImagesPath }) => {
  const [selectedId, setSelectedId] = useState(null);

  // Adjust the data to prevent the last item from overflowing into both columns
  const adjustedData = data.length % 2 === 0 ? data : [...data, { itemCode: 'empty', imageData: [] }];

  const getColor = (item) => (item === selectedId ? 'white' : 'black');

  const renderItem = useCallback(({ item }) => {
    if (item.itemCode === 'empty') {
      return <View style={styles.emptyItem} />;
    }

    return (
      <Item
        item={item}
        itemImagesPath={itemImagesPath}
        textColor={getColor(item.itemCode)}
      />
    );
  }, [selectedId]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={adjustedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.itemCode.toString()}
        extraData={selectedId}
        numColumns={2}
        initialNumToRender={10}
        windowSize={5}
        contentContainerStyle={styles.flatListContent}
      />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    paddingVertical: 2,
    margin: 2,
    borderRadius: 5,
  },
  title: {
    fontSize: 15,
  },
  swiperContainer: {
    height: 290,
    overflow: 'hidden',
  },
  slide: {
    width: screenWidth / 2 - 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    height: 290,
  },
  noImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  discountContainer: {
    borderColor: 'red',
    borderWidth: 1,
    padding: 3,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  textContainer: {
    paddingHorizontal: 5,
    marginTop: 5,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  emptyItem: {
    flex: 1,
    height: 290,
    backgroundColor: 'transparent',
  },
});

export default ItemList;

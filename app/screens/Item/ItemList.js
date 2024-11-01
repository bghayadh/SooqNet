import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  PanResponder,
  Animated,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Item = React.memo(({ item, textColor }) => {
  const validImages = item.imageData.filter(img => img.name !== null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderImage = ({ item, index }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.url }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.item}>
      <View style={styles.swiperContainer}>
        {validImages.length > 0 ? (
          <AnimatedFlatList
            horizontal
            data={validImages}
            renderItem={renderImage}
            keyExtractor={(item) => item.url} // Assuming the URL is unique
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              setCurrentIndex(index);
            }}
            snapToAlignment="center"
            decelerationRate={0.4}
            snapToInterval={200} // Adjust this to match the width of your images
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={[styles.noImageText, { color: textColor }]}>No image found</Text>
          </View>
        )}
        <Text numberOfLines={1} style={[styles.title, { color: textColor, marginLeft: 2 }]}>
          {item.itemName}
        </Text>
      </View>
    </View>
  );
});

const ItemList = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { catCode ,source, searchKey } = useLocalSearchParams();
  const [catID, setCatID] = useState(catCode);
  const [isScrolling, setIsScrolling] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy); // Detect horizontal swipe
      },
      onPanResponderGrant: () => setIsScrolling(true), // Start scrolling
      onPanResponderRelease: () => setIsScrolling(false), // Stop scrolling
    })
  ).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://192.168.1.109:8080/osc/SooqNetGetCatItem', {
          params: { catID ,source,searchKey},
        });

        if (response?.data?.category1List) {
          setData(response.data.category1List);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catID]);

  const getColor = (item) => (item === selectedId ? 'white' : 'black');

  const renderItem = useCallback(({ item }) => (
    <Item
      item={item}
      textColor={getColor(item)}
      {...panResponder.panHandlers} // Pass panResponder handlers
    />
  ), [selectedId]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.itemCode.toString()}
          extraData={selectedId}
          numColumns={2}
          initialNumToRender={10}
          windowSize={5}
          scrollEnabled={!isScrolling} // Disable vertical scrolling while scrolling horizontally
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    padding: 2,
    margin: 4,
    borderRadius: 5,
  },
  title: {
    fontSize: 15,
  },
  swiperContainer: {
    height: 250,
    overflow: 'hidden',
  },
  slide: {
    width: 200, // Adjust width according to your design
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    height: 250,
  },
  noImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemList;
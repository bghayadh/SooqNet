import React, { useState, useEffect } from 'react';
import {FlatList,SafeAreaView,StatusBar,StyleSheet,Text,BackHandler, Dimensions,TouchableOpacity,ScrollView,View,Image,Keyboard,TouchableWithoutFeedback} from 'react-native';
import axios from 'axios';
import {useRouter} from 'expo-router';
import ItemSearch from './Item/ItemSearch';
import {ipAddress,port,webAppPath} from "@env";



const Basket = () => {
 
  
  return (
    <View style={styles.container}>
    <Text>hello basket </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
    backgroundColor:"white",
  },
  
});

export default Basket;

import { Link, Stack } from 'expo-router';
import { Image, Text, View, StyleSheet } from 'react-native';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState(''); 
  const [loading, setLoading] = useState(true);
  const itemCode = 'MEN-SBP-SHO-2024-18';
  const newItemName = '123Trainers';


  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post('http://192.168.238.237:8080/osc/AxiosTest',{}, {
          params: {
            itemCode: itemCode,
            newItemName: newItemName
          }
        });
        if (response && response.data) {
          setData(response.data);
        } 
        else {
          setData('No data received.');
        }
      } catch (error) {
        console.error("There was an error!", error.message);
        setData('Error fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
  }, []); 

  return (
        <View>
            <Text>To Zeinab from Bilal, Welcome To SooqNet Mobile App!!!</Text>
            {loading ? <Text>Loading...</Text> : <Text>{data}</Text>}
        </View>
    );
}
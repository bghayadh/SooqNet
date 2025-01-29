import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator,TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipAddress, port, webAppPath } from "@env";
import { useRouter } from "expo-router";

const MyOrders = () => {
  const { loginIdentifier } = useLocalSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const GetClientDetails = async () => {
      try {
        const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/GetSooqNetClientOrdersList', {
          params: { loginIdentifier: loginIdentifier }
        });

        if (response?.data?.clientOrdersList && response.data.clientOrdersList.length > 0) {
          const formattedOrders = response.data.clientOrdersList.map(order => ({
            id: order[0], 
            status: order[1], 
            date: order[2] ,
            total: order[3] ,
          }));
          setOrders(formattedOrders);
        } else {
          setOrders([]); // No orders found
        }
      } catch (error) {
        console.error("There was an error!", error.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    GetClientDetails();
  }, [loginIdentifier]);

  const handleOrderPress = (orderId) => {
    router.push({
      pathname: '/screens/Login/OrderDetails',
      params: { orderID: orderId }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
    <View style={styles.orderContainer}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.orderTotal}>$ {item.total}</Text>
        </View>
        <Text style={styles.orderName}>Delivery Status: {item.status}</Text>
        <Text style={styles.orderDate}>Order Date: {item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noOrdersText}>
          You haven't placed any orders yet! All your orders will be listed here for you.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  orderContainer: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderName: {
    fontSize: 14,
    marginVertical: 5,
    color: '#555',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  }
});

export default MyOrders;

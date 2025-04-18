import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, VirtualizedList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import {ipAddress,port,webAppPath} from "@env";
import { MaterialIcons } from '@expo/vector-icons'; 
import Navbar from '../../Navigations/Navbar';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const OrderDetails = () => {
  //const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const {orderID} = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState({ items: [], colorsImagesPath: '', relativePath: '' ,  OrderAllDetails: [], });
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar'; 

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
         const response = await axios.get('http://'+ipAddress+':'+port+webAppPath+'/GetSooqNetClientOrderDetails', {
          params: { orderID: orderID },
        });
        const { OrderItemsDetails, colorsImagesPath, relativePath, OrderAllDetails } = response.data;

        const fetchedItems =OrderItemsDetails.map((item) => ({
          id: item[0], 
          size: item[1], 
          color: item[2],
          qty: item[3],
          unitPrice: item[4],
          netPrice: item[5],
          totalPrice: item[6],
          discount: item[5] - item[4] !== 0 ? item[4] - item[5] : 0, // Discount calculation
          name: item[7],
          hiddenCat: item[8],
          imageName: item[9],
          arabicname: item[10],
        }));
        setOrderDetails({ items: fetchedItems, colorsImagesPath, relativePath , OrderAllDetails });

      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  const constructImagePath = (imageName) => {
    const basePath =
      orderDetails.relativePath === '1'
        ? 'http://' + ipAddress + ':' + port + webAppPath + orderDetails.colorsImagesPath
        : 'http://' + ipAddress + ':' + port + orderDetails.colorsImagesPath;
        return basePath + imageName;
        
  };

  const getItemCount = () => (orderDetails?.items?.length ?? 0);

  const getItem = (data, index) => data[index];

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer,isRTL && { flexDirection: 'row-reverse' }]}>
     {item.imageName ? (
      <Image source={{ uri: constructImagePath(item.imageName) }} style={styles.itemImage} />
    ) : (
      <View style={styles.noImageContainer}>
        <MaterialIcons name="image-not-supported" size={40} color="#aaa" />
        <Text style={styles.noImageText}>{t("noImage")}</Text>
      </View>
    )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{isRTL ?
         (item.name !== 'delivery' ? item.arabicname : t("delivery")) :
         (item.name !== 'delivery' ? item.name : t("delivery")) }</Text>
        <View style={styles.gridContainer}>
        
          {item.hiddenCat=="false" && (
          <>
          <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("size")}:</Text>
            <Text style={styles.value}>{item.size}</Text>
          </View>
          <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("color")}: </Text>
            <Text style={styles.value}>{item.color}</Text>
          </View>
          </>
        )}
          <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("quantity")}</Text>
            <Text style={styles.value}>{item.qty}</Text>
          </View>
          <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("unitPrice")}:</Text>
            <Text style={styles.value}> {isRTL ? `${item.unitPrice} $` : `$${item.unitPrice}`}</Text>
          </View>
          {item.discount > 0 && (
             <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.label}>{t("discount")}:</Text>
              <Text style={[styles.value, styles.discount]}> {isRTL ? `- ${item.discount} $` : `$-${item.discount}`}</Text>
            </View>
          )}
           {item.hiddenCat=="false" && (
          <>
             <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("netPrice")}:</Text>
            <Text style={styles.value}>{isRTL ? `${item.netPrice} $` : `$${item.netPrice}`}</Text>
            </View>
          </>
        )}
          
          <View style={[styles.gridItem, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.label}>{t("total")}</Text>
            <Text style={styles.value}>{isRTL ? `${item.totalPrice} $` : `$${item.totalPrice}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {orderDetails ? (
        <>
      <View style={styles.orderInfo}>
            <Text style={styles.sectionTitle}>{t("orderSummary")}</Text>
            <View style={[styles.infoRow , isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.label}>{t("order")}:</Text>
              <Text style={styles.value}>{orderDetails.OrderAllDetails[0][0]}</Text>
            </View>
            <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.label}>{t("orderDate")}:</Text>
              <Text style={styles.value}>{orderDetails.OrderAllDetails[0][2]}</Text>
            </View>
            <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.label}>{t("deliveryStatus")}:</Text>
              <Text style={styles.value}>{t(orderDetails.OrderAllDetails[0][1])} </Text>
            </View>
            <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.label}>{t("total")}</Text>
              <Text style={styles.value}>$ {orderDetails?.OrderAllDetails?.[0]?.[3] || '0.00'} </Text>
            </View>
          </View>

          <VirtualizedList
            data={orderDetails.items}
            initialNumToRender={4}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            getItemCount={getItemCount}
            getItem={getItem}
          />
        </>
      ) : (
        <Text style={styles.noOrders}>{t("noOrderDetailsFoundStat")}</Text>
      )}
    <Navbar activetab="" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  orderInfo: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  OrderTotalValue: {
    fontSize:16,
    fontWeight: 'bold',
  },
  
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingRight: 10,
  },
  itemImage: {
    width: 120,
    height: 120,
    marginRight: 16,
    resizeMode: 'contain',
    borderRadius: 8,
    marginTop:20,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'column', // Align items vertically
  },
  gridItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#555',
    width: '40%',
  },
  value: {
    fontWeight: 'bold',
    color: '#333',
    width: '55%',
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  discount: {
    color: 'red',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  noOrders: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  noImageContainer: {
    width: 120,
    height: 120,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noImageText: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  
});

export default OrderDetails;

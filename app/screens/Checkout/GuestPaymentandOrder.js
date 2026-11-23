import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import apiClient from '../../Services/apiClient';
import { getAppSettings, formatMoney } from '../../Services/appSettings';
import { useLocalSearchParams } from 'expo-router'; 
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const GuestPaymentandOrder = () => {
  const insets = useSafeAreaInsets();
  const [basketData, setBasketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null); 
  // Fulfilment method: Home Delivery (default) or Click & Collect. The store
  // selector only appears when the server has Click & Collect turned on.
  const [shippingMethod, setShippingMethod] = useState('delivery');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const isClickCollect = shippingMethod === 'click_collect';
  // Delivery charge and currency from SYSTEM_SETTINGS; null means "not loaded yet",
  // which blocks Place Order instead of guessing an amount.
  const [appSettings, setAppSettings] = useState(null);
  const router = useRouter();
  const { t, i18n } = useTranslation(); 

  const lang = i18next.language;
  const isRTL = lang === 'ar';

  const { formData } = useLocalSearchParams(); 
  const parsedFormData = formData ? JSON.parse(formData) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedCartData = await AsyncStorage.getItem('cartData');
        if (storedCartData) {
          setBasketData(JSON.parse(storedCartData)); 
        }
        // Delivery charge and currency come from the server (System Settings).
        // When the request fails the last cached copy is used; when nothing is
        // cached the value stays null and Place Order is refused below.
        setAppSettings(await getAppSettings());
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total before discount, total discount, and final amount after discount + shipping fee
  const getWholesaleDiscount = (item) => {
    const tier = (item.wholesaleTiers || []).find(({ minQuantity, maxQuantity }) =>
      item.quentity >= minQuantity && (maxQuantity == null || item.quentity <= maxQuantity)
    );
    return Number(tier?.discountPercent || 0);
  };

  const calculateTotals = () => {
    let totalBeforeDiscount = 0;
    let totalDiscount = 0;
    let totalAfterDiscount = 0;
    let totalQty=0;

    basketData.forEach(item => {
      const retailDiscount = Number(item.discount || 0);
      const wholesaleDiscount = getWholesaleDiscount(item);
      const discountPrice = item.rate * (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100);

      totalBeforeDiscount += item.rate * item.quentity;
      totalDiscount += (item.rate - discountPrice) * item.quentity;
      totalAfterDiscount += discountPrice * item.quentity;
      totalQty +=item.quentity;

    });

    // Flat delivery charge configured on the server (System Settings). Click &
    // Collect is always free. The order total the customer sees must include it,
    // like the total the server stores.
    const deliveryFee = shippingMethod === 'click_collect'
      ? 0
      : (appSettings ? appSettings.flatRateDelivery : 0);
    const currency = appSettings ? appSettings.currency : "";
    const totalNetAmount = totalAfterDiscount + deliveryFee;

    return {
      totalBeforeDiscount,
      totalDiscount,
      totalAfterDiscount,
      deliveryFee,
      currency,
      totalNetAmount,
      totalQty,
    };
  };

  const {
    totalBeforeDiscount,
    totalDiscount,
    totalAfterDiscount,
    deliveryFee,
    currency,
    totalNetAmount,
    totalQty,
  } = calculateTotals();

  const renderItem = ({ item }) => {
    const imagePath = item.imagePath + item.imageName;
    const retailDiscount = Number(item.discount || 0);
    const wholesaleDiscount = getWholesaleDiscount(item);
    const discountPrice = item.rate * (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100);
    const effectiveDiscount = 100 * (1 - (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100));

    return (
      <View style={styles.itemRow}>
        <Image source={{ uri: imagePath }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>{formatMoney(discountPrice, currency)}</Text>
            {effectiveDiscount > 0 && (
              <Text style={styles.itemDiscount}> ({effectiveDiscount.toFixed(1)}% off)</Text>
            )}
          </View>
          <Text style={styles.itemQuantity}>{t('quantity')} {item.quentity}</Text>
        </View>
      </View>
    );
  };

  const handlePaymentMethodChange = (method) => {
    if (paymentMethod === method) {
      setPaymentMethod(null);
    } else {
      setPaymentMethod(method);
    }
  };
  const handlePlaceOrder = async () => {
    if (!appSettings) {
      // Retry once: the first load may have happened while offline. Only when the
      // server still cannot be reached is the order blocked, never guessed.
      const settings = await getAppSettings();
      if (!settings) {
        Alert.alert(t('deliveryChargeUnavailableTitle'), t('deliveryChargeUnavailable'));
        return;
      }
      setAppSettings(settings);
    }
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', t('selectPaymetMethodAlert'));
    } else {
      if (isClickCollect && !selectedStoreId) {
        Alert.alert(t('selectStoreTitle'), t('selectStoreAlert'));
        return;
      }
      try {
        
        const response = await apiClient.post('/placeOrder', {
          "dictParameter": basketData.map((item) => {
            const retailDiscount = Number(item.discount || 0);
            const wholesaleDiscount = getWholesaleDiscount(item);
            return {
              ...item,
              discount: 100 * (1 - (1 - retailDiscount / 100) * (1 - wholesaleDiscount / 100)),
            };
          }),
          "paymentMethod": paymentMethod,
          "customerName": parsedFormData.firstName +' '+ parsedFormData.lastName,
          // Click & Collect has no delivery address; the pickup branch is stored
          // separately on the order.
          "address": isClickCollect ? "" : parsedFormData.address,
          "city": isClickCollect ? "" : parsedFormData.city,
          "country": isClickCollect ? "" : parsedFormData.country,
          "phoneNumber": parsedFormData.phoneNumber,
          "mobile": parsedFormData.phoneNumber,
          "email": parsedFormData.email,
          "long": isClickCollect ? "" : parsedFormData.longitude,
          "lat": isClickCollect ? "" : parsedFormData.latitude,
          "shippingMethod": shippingMethod,
          "collectionStoreId": isClickCollect ? selectedStoreId : "",
          // Items only: the server adds the delivery charge from SYSTEM_SETTINGS,
          // so including it here would charge the customer twice.
          "netTotal": totalAfterDiscount,
          "shippingFee": deliveryFee,
          "totalQty": totalQty,
          "totalAmount": totalAfterDiscount,
        });

        if (response.status === 200) {
          // The server rejects a basket that is below an item's minimum order quantity.
          if (response.data && response.data.success === false) {
            if (response.data.error === 'minimumOrderQtyError') {
              Alert.alert(
                t('minimumOrderQtyTitle'),
                response.data.message
                  ? t('minimumOrderQtyServerMessage', { details: response.data.message })
                  : t('minOrderQtyError', { qty: 1 }),
              );
            } else {
              // Click & Collect validation (disabled feature, missing/closed store).
              Alert.alert(response.data.message || t('placingorderErrorAlert'));
            }
            return;
          }
          const stores = (appSettings && appSettings.collectionStores) || [];
          const selectedStore = stores.find((store) => store.id === selectedStoreId);
          const collectionStoreName = selectedStore
            ? (i18n.language === 'ar'
                ? (selectedStore.nameAr || selectedStore.name)
                : selectedStore.name)
            : '';
          router.push({
            pathname: '/screens/Checkout/ConfirmCheckout',
            params: {
              shippingMethod,
              collectionStoreName,
            },
          });
        } else {
          Alert.alert('Error', t('placingorderErrorAlert'));
        }

        
        console.log(response.data);  
      } catch (error) {
        console.error("Error placing order:", error.message);
        Alert.alert('Error', 'There was an error placing your order. Please try again.');
      }
    }
};

  

  if (loading) {
    return <Text>Loading...</Text>; 
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 + insets.bottom }}>
      {appSettings && appSettings.clickAndCollectEnabled && (
        <View style={styles.shippingContainer}>
          <Text style={styles.paymentMethodTitle}>{t('shippingMethod')}</Text>
          <TouchableOpacity
            style={[
              styles.checkboxContainer,
              shippingMethod === 'delivery' && styles.selectedCheckbox,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={() => setShippingMethod('delivery')}
          >
            <View style={[styles.checkbox, shippingMethod === 'delivery' && styles.checkedCheckbox]}>
              {shippingMethod === 'delivery' && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.paymentMethodText}>{t('homeDelivery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.checkboxContainer,
              shippingMethod === 'click_collect' && styles.selectedCheckbox,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
            onPress={() => setShippingMethod('click_collect')}
          >
            <View style={[styles.checkbox, shippingMethod === 'click_collect' && styles.checkedCheckbox]}>
              {shippingMethod === 'click_collect' && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.paymentMethodText}>{t('clickAndCollect')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isClickCollect && (
        <View style={styles.storeContainer}>
          <Text style={styles.paymentMethodTitle}>{t('selectStore')}</Text>
          {!appSettings || !appSettings.collectionStores || appSettings.collectionStores.length === 0 ? (
            <Text style={styles.storeEmpty}>{t('noStoreAvailable')}</Text>
          ) : (
            appSettings.collectionStores.map((store) => {
              const storeName = i18n.language === 'ar' ? (store.nameAr || store.name) : store.name;
              const storeCity = i18n.language === 'ar' ? (store.cityAr || store.city) : store.city;
              const selected = selectedStoreId === store.id;
              return (
                <TouchableOpacity
                  key={store.id}
                  style={[
                    styles.storeRow,
                    selected && styles.selectedStoreRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                  onPress={() => setSelectedStoreId(store.id)}
                >
                  <View style={[styles.checkbox, selected && styles.checkedCheckbox]}>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.storeText}>
                    <Text style={styles.storeName}>{storeName}</Text>
                    {storeCity ? <Text style={styles.storeCity}>{storeCity}</Text> : null}
                    {store.address ? <Text style={styles.storeAddress}>{store.address}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}

      <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentMethodTitle}>{t('selectPaymentMethod')}</Text>

        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            paymentMethod === 'Cash On Delivery' && styles.selectedCheckbox,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}
          onPress={() => handlePaymentMethodChange('Cash On Delivery')}
        >
          <View
            style={[
              styles.checkbox,
              paymentMethod === 'Cash On Delivery' && styles.checkedCheckbox,
            ]}
          >
            {paymentMethod === 'Cash On Delivery' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.paymentMethodText}>{t('cashOnDelivery')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            paymentMethod === 'creditCard' && styles.selectedCheckbox,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}
          onPress={() => handlePaymentMethodChange('creditCard')}
          disabled
        >
          <View
            style={[
              styles.checkbox,
              paymentMethod === 'creditCard' && styles.checkedCheckbox,
            ]}
          >
            {paymentMethod === 'creditCard' && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.paymentMethodText, styles.disabledText]}> {t('creditCard')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lineDivider}></View>

      <View style={styles.orderItemsContainer}>
        <Text style={styles.orderItemsTitle}>
        {t('orderItem')}({basketData.length})
        </Text>
        <FlatList
          data={basketData}
          renderItem={renderItem}
          keyExtractor={(item) => item.ID.toString()}
          horizontal // Display items in a horizontal row
          showsHorizontalScrollIndicator={false} // Hide the horizontal scroll bar
          inverted={isRTL}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}> {t('orderSummary')}</Text>

        <View style={[styles.summaryRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.summaryText}>{t('total')}</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalBeforeDiscount, currency)}</Text>
        </View>

        <View style={[styles.summaryRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.summaryText}>{t('totalDiscount')}</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>-{formatMoney(totalDiscount, currency)}</Text>
        </View>

        <View style={[styles.summaryRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.summaryText}>{t('shippingFee')}</Text>
          <Text style={styles.summaryValue}>{formatMoney(deliveryFee, currency)}</Text>
        </View>

        <View style={styles.lineDivider}></View>

        <View style={[styles.summaryRow,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.summaryText}>{t('totalNetAmount')}</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalNetAmount, currency)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderText}>{t('placeOrder')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  paymentMethodContainer: {
    marginVertical: 20,
  },
  shippingContainer: {
    marginTop: 20,
  },
  storeContainer: {
    marginBottom: 10,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 8,
  },
  selectedStoreRow: {
    backgroundColor: '#f0f0f0',
    borderColor: '#4CAF50',
  },
  storeText: {
    flex: 1,
    marginHorizontal: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  storeCity: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  storeAddress: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  storeEmpty: {
    fontSize: 15,
    color: '#999',
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: '#fff',
  },
  selectedCheckbox: {
    backgroundColor: '#f0f0f0',
  },
  checkmark: {
    fontSize: 13,
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  orderItemsContainer: {
    marginVertical: 20,
  },
  orderItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'column',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
  },
  itemInfo: {
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDiscount: {
    fontSize: 14,
    color: 'red',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
  },
  summaryContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountValue: {
    color: 'red',
  },
  lineDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default GuestPaymentandOrder;

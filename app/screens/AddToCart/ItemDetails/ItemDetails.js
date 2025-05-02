import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';  // Importing useTranslation hook

const ItemDetails = ({ itemData ,isRTL}) => {
  
  const { t, i18n } = useTranslation(); 

  const ITEM_NAME =itemData[0][1];
  const ARABIC_ITEM_NAME=itemData[0][6];
  const RATE =itemData[0][2];
  const ITEM_DISCOUNT =itemData[0][3];
  const ENGLISH_ITEM_DESCRIPTION =itemData[0][5];
  const ARABIC_ITEM_DESCRIPTION =itemData[0][7];
  const ITEM_DESCRIPTION=isRTL ? ARABIC_ITEM_DESCRIPTION : ENGLISH_ITEM_DESCRIPTION;

  // Calculate the discount and final price
  const oldPrice = parseFloat(RATE); 
  const discount = ITEM_DISCOUNT ? parseFloat(ITEM_DISCOUNT) : 0; // If no discount, set to 0
  const discountAmount = discount ? (oldPrice * discount) / 100 : 0;
  const newPrice = oldPrice - discountAmount;

  // State for handling the expand/collapse of description
  const [expanded, setExpanded] = useState(false);

  // Handle description expand/collapse
  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      
      <Text style={[styles.itemName,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>{isRTL ? ARABIC_ITEM_NAME:ITEM_NAME}</Text>

     
      <View style={[styles.priceContainer ,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {discount > 0 ? (
          <>   
            <Text style={styles.oldPrice}>${oldPrice.toFixed(2)}</Text>  
            <View style={[styles.discountContainer,{ flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.discountText}>-{discount}%</Text>
              <Text style={styles.newPrice}>${newPrice.toFixed(2)}</Text>
            </View>
          </>
        ) : (
          // If no discount, only show the normal price
          <Text style={styles.newPrice}>${oldPrice.toFixed(2)}</Text>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {expanded 
              ? ITEM_DESCRIPTION 
              : (ITEM_DESCRIPTION && ITEM_DESCRIPTION !== "" ? ITEM_DESCRIPTION.slice(0, 100)  : "")
            }
        </Text>

        {ITEM_DESCRIPTION && ITEM_DESCRIPTION.length > 100 && (
          <TouchableOpacity onPress={toggleDescription}>
            <Text style={styles.expandButton}>{expanded ? t('show less') : t('show more') }</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10, 
    margin:10,
    backgroundColor: '#fff',
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,  
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,  
  },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 10,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    backgroundColor: '#FF6347',
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 10,
    marginLeft: 5,
  },
  newPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  expandButton: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 5,
  },
});




export default ItemDetails;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ItemDetails = ({ itemData }) => {
  
  const ITEM_NAME =itemData[0][1];
  const RATE =itemData[0][2];
  const ITEM_DISCOUNT =itemData[0][3];
  const ITEM_DESCRIPTION =itemData[0][5];

//console.log("ITEM_NAMEffff "+ITEM_NAME)
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
      
      <Text style={styles.itemName}>{ITEM_NAME}</Text>

     
      <View style={styles.priceContainer}>
        {discount > 0 ? (
          <>   
            <Text style={styles.oldPrice}>${oldPrice.toFixed(2)}</Text>  
            <View style={styles.discountContainer}>
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
          {expanded ? ITEM_DESCRIPTION : ITEM_DESCRIPTION.slice(0, 100) + '...'}
        </Text>

        {ITEM_DESCRIPTION.length > 100 && (
          <TouchableOpacity onPress={toggleDescription}>
            <Text style={styles.expandButton}>{expanded ? 'Show Less' : 'Show More'}</Text>
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

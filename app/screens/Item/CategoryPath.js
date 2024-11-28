import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CategoryPath = ({ fullCatCode, fullCatTitle, categories, onCategoryPress }) => {
  // Split the fullCatCode into parts
  const catParts = fullCatCode.split('-');
  const catTitleParts = fullCatTitle.split('-');

  return (
    <View style={styles.container}>
      {/* Horizontal ScrollView */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.pathContainer}>
          {catParts.map((part, index) => {
            // Get the title from catTitleParts at the same index as the part
            const categoryTitle = catTitleParts[index] || part; // Fallback to part if title is not available

            const handleCategoryPress = () => {
              // Update fullCatCode to include categories up to this point
              const updatedCatCode = catParts.slice(0, index + 1).join('-');
              const updatedCatTitle = catTitleParts.slice(0, index + 1).join('-');
              onCategoryPress(updatedCatCode, updatedCatTitle);  // Call the function passed from ItemView
            };

            return (
              <View key={index} style={styles.categoryPart}>
                <TouchableOpacity onPress={handleCategoryPress}>
                  <Text style={styles.categoryText}>{categoryTitle}</Text> 
                </TouchableOpacity>
                {index < catParts.length - 1 && <Text style={styles.separator}> / </Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Use padding to space out the edges if necessary
    padding: 10,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#000',
    // textDecorationLine: 'underline',  // Uncomment this to add an underline to clickable text
  },
  separator: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default CategoryPath;

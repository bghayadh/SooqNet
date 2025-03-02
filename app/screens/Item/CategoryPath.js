import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import i18next from 'i18next';

const CategoryPath = ({ fullCatCode, fullCatTitle, fullArabicCatTitle, categories, onCategoryPress }) => {
  // Split the fullCatCode into parts
  const catParts = fullCatCode.split('-');
  const catTitleParts = fullCatTitle.split('-');
  const arabicCatTitleParts = fullArabicCatTitle.split('-');

  const lang = i18next.language;
  const isRTL = lang === 'ar'; // Check if the language is Arabic

  // If in RTL, reverse the category title parts and the code
  const displayedTitles = isRTL ? arabicCatTitleParts.reverse() : catTitleParts;
  const displayedCatCode = isRTL ? catParts.reverse() : catParts;

  return (
    <View style={[styles.container,isRTL && styles.rtlContainer]}>
      {/* Horizontal ScrollView */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollViewContainer, isRTL && styles.rtlContentContainer]} // Reverse the content direction for RTL
      >
        <View style={styles.pathContainer}> 
          {displayedCatCode.map((part, index) => {
            const categoryTitle = displayedTitles[index] || part; // Use the reversed title if RTL
            const arabicCategoryTitle = arabicCatTitleParts[index] || part; // Use Arabic title if available
            const handleCategoryPress = () => {
              /*here the reverse may cause an rara issue if user navigate through categories and then press on some 
              path(category title) very fast for muliple times so catcode could be reversed twice in rtl case and 
               thus casue wrong cat code*/
               
              // Update fullCatCode to include categories up to this point
              //const updatedCatCode = displayedCatCode.slice(0, index + 1).join('-');
              const updatedCatCode =isRTL ? displayedCatCode.reverse().slice(0, displayedCatCode.length-index).join('-'): displayedCatCode.slice(0, index + 1).join('-');

              console.log("updatedCatCode "+updatedCatCode);
             // const updatedCatTitle = displayedTitles.slice(0, index + 1).join('-');
              const updatedCatTitle =isRTL ? catTitleParts.reverse().slice(0, catTitleParts.length-index).join('-'): catTitleParts.slice(0, index + 1).join('-');

              //const updatedArabicCatTitle = arabicCatTitleParts.slice(0, index + 1).join('-');
              const updatedArabicCatTitle =isRTL ? arabicCatTitleParts.reverse().slice(0, arabicCatTitleParts.length-index).join('-'): arabicCatTitleParts.slice(0, index + 1).join('-');


              onCategoryPress(updatedCatCode, updatedCatTitle, updatedArabicCatTitle);  // Call the function passed from ItemView
            };

            return (
              <View key={index} style={styles.categoryPart}>
                <TouchableOpacity onPress={handleCategoryPress}>
                  <Text style={styles.categoryText}>
                    {isRTL ? arabicCategoryTitle : categoryTitle}
                  </Text>
                </TouchableOpacity>
                {index < displayedCatCode.length - 1 && <Text style={styles.separator}> / </Text>}
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
    padding: 10,
  },
  pathContainer: {
    flexDirection: 'row', // Default for LTR
    alignItems: 'center',
  },
  rtlContainer: {
    alignItems: 'flex-end',
  },
  scrollViewContainer: {
    flexDirection: 'row', // Default for LTR
  },
  rtlContentContainer: {
    flexDirection: 'row-reverse', // Reverse the direction for RTL (start from right)
  },
  categoryPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#000',
  },
  separator: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default CategoryPath;
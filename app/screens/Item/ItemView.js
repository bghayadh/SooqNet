import React from 'react';
import { View ,ScrollView,SafeAreaView,StyleSheet} from 'react-native';
import ItemList from './ItemList';


function ItemView(props) {
    return (
        <SafeAreaView  style={styles.container}>
            <ItemList/>
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    
      },
})

export default ItemView;
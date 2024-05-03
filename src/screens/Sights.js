import React, {useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

// Importing static images from the assets folder
import animalImage from '../../assets/animalThumbnail.png'; 
import plantImage from '../../assets/plantThumbnail.png';  

const SightsScreen = ({ navigation }) => {
  const navigateToCategory = (category) => {
    navigation.navigate('CategoryScreen', { category });
  };



  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.box} onPress={() => navigateToCategory('Animals')}>
        <Image source={animalImage} style={styles.thumbnail} />
        <Text>Animals</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.box} onPress={() => navigateToCategory('Plants')}>
        <Image source={plantImage} style={styles.thumbnail} />
        <Text>Plants</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SightsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  box: {
    margin: 10,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 150,   
    height: 150,  
    marginBottom: 5,
  },
});

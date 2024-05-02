import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const SightsScreen = ({ navigation }) => {
  const navigateToCategory = (category) => {
    navigation.navigate('CategoryScreen', { category });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.box} onPress={() => navigateToCategory('Animals')}>
        <Text>Animals</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.box} onPress={() => navigateToCategory('Plants')}>
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
    backgroundColor: '#DDD',
  },
});

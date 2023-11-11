import { StyleSheet, Text, View } from "react-native";
import React from "react";

const PozaScreen = () => {
  return (
    <View style={styles.container}>
      <Text>POZA CLICK CLICK</Text>
    </View>
  );
};

export default PozaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

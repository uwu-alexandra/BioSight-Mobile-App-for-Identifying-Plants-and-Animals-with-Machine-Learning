import { StyleSheet, Text, View } from "react-native";
import React from "react";

const SightsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Vederi</Text>
    </View>
  );
};

export default SightsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

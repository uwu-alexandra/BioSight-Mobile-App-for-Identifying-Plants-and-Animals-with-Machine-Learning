import { StyleSheet, Text, View } from "react-native";
import React from "react";

const RegisterScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Înregistrare</Text>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

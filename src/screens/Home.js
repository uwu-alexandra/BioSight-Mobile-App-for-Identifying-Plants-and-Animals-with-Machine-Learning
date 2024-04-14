import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";

const HomeScreen = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

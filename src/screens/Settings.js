import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";

const SettingsScreen = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Settings:</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

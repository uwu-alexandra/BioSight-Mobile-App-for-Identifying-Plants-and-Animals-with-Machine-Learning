import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomTab from "./src/BottomTab";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={"dark-content"} />
      <NavigationContainer>
        <BottomTab />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

//SOURCE NAVBAR: https://www.youtube.com/watch?app=desktop&v=t0GMzGgHwgk
//CAMERA CODE: https://docs.expo.dev/versions/latest/sdk/camera/

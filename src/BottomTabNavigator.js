import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import React from "react";
import HomeScreen from "./screens/Home";
import SightsScreen from "./screens/Sights";
import MapScreen from "./screens/Map";
import SettingsScreen from "./screens/Settings";
import CameraButton from "./CameraButton";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        showLabel: false,
        style: {
          backgroundColor: "white",
          position: "absolute",
          bottom: 40,
          marginHorizontal: 20,
          height: 60,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 10, height: 10 },
          paddingHorizontal: 20,
        },
      }}
    >
      <Tab.Screen
        name={"Home"}
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                top: 20,
              }}
            >
              <Entypo
                name="home"
                size={27}
                color={focused ? "red" : "gray"}
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Sights"}
        component={SightsScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                top: 20,
              }}
            >
              <FontAwesome5
                name="book"
                size={24}
                color={focused ? "red" : "gray"}
              ></FontAwesome5>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"ActionButton"}
        component={CameraButton}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 55,
                backgroundColor: "red",
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: Platform.OS == "ios" ? 50 : 30,
              }}
            >
              <Entypo
                name="camera"
                size={25}
                color="white"
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Map"}
        component={MapScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                top: 20,
              }}
            >
              <Entypo
                name="map"
                size={25}
                color={focused ? "red" : "gray"}
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Settings"}
        component={SettingsScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                top: 20,
              }}
            >
              <Ionicons
                name="settings-sharp"
                size={24}
                color={focused ? "red" : "gray"}
              ></Ionicons>
            </View>
          ),
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}

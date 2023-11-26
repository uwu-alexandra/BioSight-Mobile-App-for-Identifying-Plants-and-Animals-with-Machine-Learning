import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import React from "react";
import HomeScreen from "./screens/Home";
import SightsScreen from "./screens/Sights";
import MapScreen from "./screens/Map";
import SettingsScreen from "./screens/Settings";
import CameraButton from "./CameraButton";
import { colors } from "./Colors";

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
        name={"Acasă"}
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
                color={focused ? colors.focused : colors.unfocused}
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Catalog"}
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
                color={focused ? colors.focused : colors.unfocused}
              ></FontAwesome5>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Identificare"}
        component={CameraButton}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 55,
                height: 55,
                backgroundColor: colors.focused,
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
        name={"Hartă"}
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
                color={focused ? colors.focused : colors.unfocused}
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Setări"}
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
                color={focused ? colors.focused : colors.unfocused}
              ></Ionicons>
            </View>
          ),
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
}

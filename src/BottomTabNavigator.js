import React, { createContext, useContext, useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome5, Entypo, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import HomeScreen from "./screens/Home";
import SightsScreen from "./screens/Sights";
import MapScreen from "./screens/Map";
import SettingsScreen from "./screens/Settings";
import CameraButton from "./CameraButton";
import RegisterScreen from "./screens/Register";
import LoginScreen from "./screens/Login";
import { colors, darkColors } from "./Colors";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config";
import { useTheme } from "../src/ThemeProvider";
import CategoryScreen from "./screens/Category";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create a context for the user state
const UserContext = createContext();

// Custom hook to access the user context
export const useUser = () => {
  return useContext(UserContext);
};

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const SightsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Back" component={SightsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={({ route }) => ({ title: route.params.category })} />
    </Stack.Navigator>
  );
};


const MainStack = () => {
  const user = useUser();
  const { theme } = useTheme(); // Using theme from ThemeProvider

  return (
    <Tab.Navigator
      screenOptions={{
        showLabel: false,
        style: {
          backgroundColor: theme.background,  // Use background color from theme
          position: "absolute",
          bottom: 40,
          marginHorizontal: 20,
          height: 60,
          borderRadius: 10,
          shadowColor: theme.shadowColor,
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
                color={focused ? theme.focused : theme.unfocused}
              ></Entypo>
            </View>
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Sights"}
        component={SightsStack} 
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
                color={
                  user && user.isGuest
                    ? "lightgray"
                    :focused ? theme.focused : theme.unfocused
                }
              ></FontAwesome5>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                if (user && user.isGuest) {
                  alert("Sights are not available for guest users.");
                } else {
                  props.onPress(); // Continue with original handler if not a guest
                }
              }}
            />
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Identify"}
        component={CameraButton}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                flex: focused ? -1 : undefined,
                width: 55,
                height: 55,
                backgroundColor: colors.focused,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: Platform.OS == "ios" ? 50 : 30,
              }}
            >
              <Entypo name="camera" size={25} color="white"></Entypo>
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
                color={
                  user && user.isGuest
                    ? "lightgray"
                    :focused ? theme.focused : theme.unfocused
                }
              ></Entypo>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                if (user && user.isGuest) {
                  alert("Map are not available for guest users.");
                } else {
                  props.onPress(); // Continue with original handler if not a guest
                }
              }}
            />
          ),
        }}
      ></Tab.Screen>

      <Tab.Screen
        name={"Settings"}
        component={SettingsScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "absolute", top: 20 }}>
              <Ionicons
                name="settings-sharp"
                size={24}
                color={ focused ? theme.focused : theme.unfocused}
              ></Ionicons>
            </View>
          ),
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  const onAuthStateChangedHandler = (user) => {
    if (user) {
      const enhancedUser = { ...user, isGuest: user.isAnonymous };
      setUser(enhancedUser);
    } else {
      setUser(null);
    }
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return unsubscribe;
  }, []);

  // Provide the user state through context
  return (
    <UserContext.Provider value={user}>
      <Stack.Navigator>
        {user ? (
          // Render MainStack if the user is logged in
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{ headerShown: false }}
          />
        ) : (
          // Render AuthStack if the user is not logged in
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </UserContext.Provider>
  );
}
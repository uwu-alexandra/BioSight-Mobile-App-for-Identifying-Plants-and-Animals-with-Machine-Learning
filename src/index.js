import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text } from "react-native";
import Chat from "./screens/Chat";
import Likes from "./screens/Likes";
import Home from "./screens/Home";
import Config from "./screens/Config";
import Notifications from "./screens/Notifications";
import { TabButton } from "./components";

const Tab = createBottomTabNavigator();

export default () => {
  const tabs = [
    {
      id: 1,
      title: "Messages",
      screen: "Chat",
      icon: "message-text",
      Component: Chat,
    },
    {
      id: 2,
      title: "Likes",
      screen: "Likes",
      icon: "heart",
      Component: Likes,
    },
    {
      id: 3,
      title: "Home",
      screen: "Home",
      icon: "home",
      Component: Home,
    },
    {
      id: 4,
      title: "Settings",
      screen: "Settings",
      icon: "cog",
      Component: Config,
    },
    {
      id: 5,
      title: "Activity",
      screen: "Notifications",
      icon: "bell",
      Component: Notifications,
    },
  ];

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={"Home"}
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        {tabs.map((item, index) => (
          <Tab.Screen
            key={item.id}
            name={item.screen}
            component={item.Component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => (
                <TabButton
                  item={item}
                  {...props}
                />
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    position: "absolute",
    bottom: 25,
    marginHorizontal: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#dadada",
  },
});

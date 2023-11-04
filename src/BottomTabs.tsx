import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/Home";
import Cart from "./screens/Cart";
import Profile from "./screens/Profile";
import Favourite from "./screens/Favourite";
import CustomBottomTab from "./components/BottomTabs/CustomBottomTab";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomBottomTab {...props} />}>
      <Tab.Group
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          options={{ tabBarLabel: "Acasă" }}
          name="Home"
          component={Home}
        />
        <Tab.Screen
          options={{ tabBarLabel: "Cart" }}
          name="Cart"
          component={Cart}
        />
        <Tab.Screen
          options={{ tabBarLabel: "Profile" }}
          name="Profile"
          component={Profile}
        />
        <Tab.Screen
          options={{ tabBarLabel: "Favorite" }}
          name="Favorite"
          component={Favourite}
        />
      </Tab.Group>
    </Tab.Navigator>
  );
}

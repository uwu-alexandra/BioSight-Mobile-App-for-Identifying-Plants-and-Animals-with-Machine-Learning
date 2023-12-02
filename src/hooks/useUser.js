import React from "react";
import { Text } from "react-native";
import { useUser } from "./path-to-AppNavigator";

const ExampleComponent = () => {
  const user = useUser();

  return <Text>{user ? `Welcome, ${user.email}!` : "Not logged in."}</Text>;
};

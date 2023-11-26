import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../Colors";
import TextField from "../components/Textfield";
import logoPng from "../../assets/logoPng.png";

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <Image
        source={logoPng}
        style={styles.logo}
      />

      <View style={styles.inputContainer}>
        <TextField
          label="Email"
          // value={}
          // onChangeText={text =>}
          style={{ marginBottom: 20 }}
        />
        <TextField
          label="Password"
          // value={}
          // onChangeText={text =>}
          style={{ marginBottom: 10 }}
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <View>
          <Text style={styles.registerLinkText}>
            Nu ai cont? Înregistrează-te aici.
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {}}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  logo: {
    width: 400,
    height: 120,
    marginBottom: 20,
    transform: [{ scale: 0.5 }],
    paddingBottom: 30,
  },
  inputContainer: {
    width: "80%",
  },
  buttonContainer: {
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: colors.focused,
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
  loginButtonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  registerLinkText: {
    textDecorationLine: "underline",
    marginStart: 90,
  },
});

export default LoginScreen;

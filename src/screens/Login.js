import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import AnimatedInput from "react-native-animated-input";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../Colors";

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.inputContainer}>
        <AnimatedInput
          placeholder="Email"
          valid={isValid}
          errorText="Error"
          onChangeText={handleChange}
          value={email}
          styleLabel={{ fontWeight: "600" }}
          styleBodyContent={{ borderBottomWidth: 1.5 }}
        />
        <TextInput
          placeholder="Password"
          // value={}
          // onChangeText={text =>}
          style={[styles.input, { marginBottom: 10 }]}
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
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    height: 40,
    borderColor: colors.unfocused,
    borderWidth: 1,
    paddingLeft: 10,
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

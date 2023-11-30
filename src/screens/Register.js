import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { colors } from "../Colors";
import TextField from "../components/TextfField";
import logoPng from "../../assets/logoPng.png";

const RegisterScreen = () => {
  const navigation = useNavigation();

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View style={styles.container}>
        <Image
          source={logoPng}
          style={styles.logo}
        />

        <View style={styles.inputContainer}>
          <TextField
            label="Username"
            // value={}
            // onChangeText={text =>}
            style={{ marginBottom: 20 }}
          />
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
            style={{ marginBottom: 20 }}
            secureTextEntry
          />
          <TextField
            label="Confirm password"
            // value={}
            // onChangeText={text =>}
            style={{ marginBottom: 10 }}
            secureTextEntry
          />
        </View>
        <View style={[styles.buttonContainer, { marginTop: 10 }]}>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.registerloginButton}
          >
            <Text style={styles.registerloginButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <View>
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={{ color: colors.focused, fontWeight: "bold" }}>
                Login
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
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
    marginTop: 10,
  },
  registerloginButton: {
    backgroundColor: colors.focused,
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
  registerloginButtonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  loginLinkText: {
    marginTop: 10,
    fontSize: 20,
  },
});

export default RegisterScreen;

import { StyleSheet, Text, View, Image } from "react-native";
import { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { colors } from "../Colors";
import TextField from "../components/TextField";
import logoPng from "../../assets/logoPng.png";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase.config";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in with:" + user.email);
        alert(user.email + " Welcome back! 🎉");
        if (user) {
          navigation.replace("Main", { screen: "Home" });
        }
      })
      .catch((error) => alert(error.message));
  };

  const handleGuestLogin = () => {
    signInAnonymously(auth)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in anonymously as guest:" + user.uid);
        alert("Welcome guest " + user.uid);
        navigation.replace("Main", { screen: "Home" });
      })
      .catch((error) => alert(error.message));
  };
  
  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View style={styles.container}>
        <Image
          source={logoPng}
          style={styles.logo}
        />

        <View style={styles.inputContainer}>
          <TextField
            label="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={{ marginBottom: 20 }}
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={{ marginBottom: 10 }}
            secureTextEntry
          />
        </View>
        <View style={[styles.buttonContainer, { marginTop: 20 }]}>
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleGuestLogin}
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>Guest</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <View>
            <Text style={styles.registerLinkText}>
              Don't have an account?{" "}
              <Text style={{ color: colors.focused, fontWeight: "bold" }}>
                Sign up
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
  guestButton: {
    backgroundColor: colors.unfocused,
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
  guestButtonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  registerLinkText: {
    marginTop: 10,
    fontSize: 20,
  },
});

export default LoginScreen;

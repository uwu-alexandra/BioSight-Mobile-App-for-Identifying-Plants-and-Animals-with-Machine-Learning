// Import necessary React and React Native components
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Switch, Alert, Platform, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { colors, darkColors } from '../Colors'; 
import { useTheme } from '../ThemeProvider';

const SettingsScreen = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);  // State to track the current user

  useEffect(() => {
    // Subscribe to user authentication state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });

    // Load initial state for permissions asynchronously
    (async () => {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
    })();

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  const handleCameraPermissionToggle = async (value) => {
    if (value) {
      const response = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(response.status === 'granted');
    } else {
      Alert.alert("Change in Settings", "Please disable camera permission in your system settings.");
    }
  };

  const handleLocationPermissionToggle = async (value) => {
    if (value) {
      const response = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(response.status === 'granted');
    } else {
      Alert.alert("Change in Settings", "Please disable location permission in your system settings.");
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Use theme-based colors dynamically throughout the component
  const themeColors = isDarkMode ? darkColors : colors;

  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: themeColors.background,  
    },
    text: {
      fontSize: 20,
      color: themeColors.text,  
    },
    textGreeting: {
      fontSize: 20,
      color: themeColors.text,  
      textAlign: 'center',
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.textGreeting}>
        Current user: {currentUser ? currentUser.email : "Guest"}{"\n\n\n"}
      </Text>
      <View style={dynamicStyles.settingItem}>
        <Text style={dynamicStyles.text}>Camera Permission:</Text>
        <Switch
          onValueChange={handleCameraPermissionToggle}
          value={hasCameraPermission}
          trackColor={{ true: themeColors.trackColor }}
        />
      </View>
      <View style={dynamicStyles.settingItem}>
        <Text style={dynamicStyles.text}>Location Permission:</Text>
        <Switch
          onValueChange={handleLocationPermissionToggle}
          value={hasLocationPermission}         
          trackColor={{ true: isDarkMode ? themeColors.trackColor : colors.trackColor, false: isDarkMode ? themeColors.trackColor : colors.trackColor }}
        />
      </View>
      <View style={dynamicStyles.settingItem}>
        <MaterialCommunityIcons
          name={isDarkMode ? 'weather-night' : 'white-balance-sunny'}
          size={24}
          color={themeColors.text}  
        />
        <Text style={dynamicStyles.text}>Using {isDarkMode ? 'dark' : 'light'} {"theme:                     "}</Text>
        <Switch
          thumbColor={themeColors.thumbColor}
          onValueChange={handleThemeToggle}
          value={isDarkMode}
          trackColor={{ true: themeColors.trackColor }}
        />
      </View>
      <Button
        title="LOGOUT"
        onPress={() => signOut(auth)}  // Use async function directly if additional logic is not required
        color={themeColors.special}  
      />
    </View>
  );
};

export default SettingsScreen;

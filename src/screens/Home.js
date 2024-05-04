import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Animated } from "react-native";
import classData from "../../backend/combined_class_names.json";
import animalClasses from "../../backend/class_names_animals.json";
import plantClasses from "../../backend/class_names_plants.json";
import { colors, darkColors } from "../Colors";  // Ensure this import path is correct
import { useTheme } from "../ThemeProvider";  

const HomeScreen = () => {
  const [dailyClass, setDailyClass] = useState("");
  const [funFacts, setFunFacts] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { isDarkMode, setIsDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const themeColors = isDarkMode ? darkColors : colors;

  useEffect(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    const index = parseInt(dateString, 10) % classData.length;
    const selectedClass = classData[index];
    setDailyClass(selectedClass);

    if (animalClasses.includes(selectedClass) || plantClasses.includes(selectedClass)) {
      const categoryClass = animalClasses.includes(selectedClass) ? 'animal' : 'plant';
      const text = `In 100-150 tokens, tell me something interesting about ${selectedClass}.`;
      fetchOpenAI(text);
    }

    fetchImage(selectedClass);
  }, []);

  const triggerAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  };

  const fetchOpenAI = async (text) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${'sk-proj-'}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: 'system', content: 'You are a scientist of birds and animals.' }, { role: 'user', content: text }],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 1
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to fetch fun facts: ${data.error?.message}`);
      }

      setFunFacts(data.choices[0].message.content.trim() || 'No fun facts found');
    } catch (error) {
      console.error('Error fetching fun facts:', error);
      setFunFacts(`Failed to fetch fun facts: ${error.message}`);
    }
  };

  const fetchImage = (query) => {
    fetch(`https://pixabay.com/api/?key=43706303-c295bd51123a70068ba9d3236&q=${encodeURIComponent(query)}&image_type=photo`)
      .then((response) => response.json())
      .then((data) => {
        setImageUrl(data.hits && data.hits.length > 0 ? data.hits[0].webformatURL : "");
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        setImageUrl("");
      });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 30,
      backgroundColor: themeColors.background,
    },
    appName: {
      textDecorationLine: "underline",
      color: themeColors.focused,
      fontWeight: "bold",
      fontSize: 20,
    },
    todayInfo: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      color: themeColors.text,
    },
    funFacts: {
      fontSize: 18,
      lineHeight: 24,
      fontStyle: 'italic',
      color: themeColors.text,
    },
    image: {
      width: 300,
      height: 300,
      resizeMode: "contain",
      marginVertical: 15,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.todayInfo}>
        Today's class is{" "}
        <TouchableOpacity onPress={triggerAnimation}>
          <Animated.Text style={[dynamicStyles.appName, { transform: [{ scale: scaleAnim }] }]}>
            {dailyClass}
          </Animated.Text>
        </TouchableOpacity>
        !{"\n"}
        Date: {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <Text style={dynamicStyles.funFacts}>{funFacts}</Text>
      {imageUrl && <Image source={{ uri: imageUrl }} style={dynamicStyles.image} />}
    </ScrollView>
  );
};

export default HomeScreen;

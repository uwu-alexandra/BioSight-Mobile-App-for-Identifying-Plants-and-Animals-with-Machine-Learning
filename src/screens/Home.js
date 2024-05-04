import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Animated } from "react-native";
import classData from "../../backend/combined_class_names.json";
import animalClasses from "../../backend/class_names_animals.json";
import plantClasses from "../../backend/class_names_plants.json";

const HomeScreen = () => {
  const [dailyClass, setDailyClass] = useState("");
  const [funFacts, setFunFacts] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current; // Initial scale is 1

  useEffect(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    const index = parseInt(dateString, 10) % classData.length;
    const selectedClass = classData[index];
    setDailyClass(selectedClass);
    console.log("Selected class set to:", selectedClass); // Debug: Check the selected class

    if (animalClasses.includes(selectedClass) || plantClasses.includes(selectedClass)) {
      const categoryClass = animalClasses.includes(selectedClass) ? 'animal' : 'plant';
      const text = `In 100-150 tokens, tell me something interesting about ${selectedClass}.`;
      fetchOpenAI(text);
    }

    fetchImage(selectedClass);
  }, []);

  const triggerAnimation = () => {
    console.log("Animation triggered"); // Debug: Confirm this function is called
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5, // Increase the scale to make it more noticeable
        duration: 500, // Increase duration to see the effect clearly
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Return to normal size
        duration: 500,
        useNativeDriver: true
      })
    ]).start(() => console.log("Animation completed")); // Debug: Check if the animation completes
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

    // Accessing the content from the nested message object
    const funFact = data.choices[0].message.content.trim() || 'No fun facts found';
    setFunFacts(funFact);
  } catch (error) {
    console.error('Error fetching fun facts:', error);
    setFunFacts(`Failed to fetch fun facts: ${error.message}`);
  }
};

  const fetchImage = (query) => {
    fetch(
      `https://pixabay.com/api/?key=43706303-c295bd51123a70068ba9d3236&q=${encodeURIComponent(
        query
      )}&image_type=photo`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.hits && data.hits.length > 0) {
          setImageUrl(data.hits[0].webformatURL);
        } else {
          setImageUrl(""); // Reset or set a default image if no results found
        }
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        setImageUrl(""); // Handle error or set a default image
      });
  };
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.todayInfo}>
        Today's class is{" "}
        <TouchableOpacity onPress={triggerAnimation}>
          <Animated.Text style={[styles.appName, { transform: [{ scale: scaleAnim }] }]}>
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
      <Text style={styles.funFacts}>{funFacts}</Text>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    padding: 15,
    backgroundColor: "#FAFAFA",
  },
  appName: {
    textDecorationLine: "underline",
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 20,
  },
  todayInfo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "black",
  },
  funFacts: {
    fontSize: 18,
    lineHeight: 24,
    fontStyle: 'italic',
    color: 'black',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginVertical: 10,
  },
});

export default HomeScreen;
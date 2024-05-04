import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import classData from "../../backend/combined_class_names.json";
import animalClasses from "../../backend/class_names_animals.json";
import plantClasses from "../../backend/class_names_plants.json";

const HomeScreen = () => {
  const [dailyClass, setDailyClass] = useState("");
  const [animalData, setAnimalData] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

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

  useEffect(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}${(today.getMonth() + 5)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    const index = parseInt(dateString, 10) % classData.length;
    const selectedClass = classData[index];
    setDailyClass(selectedClass);

    const apiKey = "vIvKJ5sbGV9hRWX4wVfVeguOZ0o528f-IRMvVvaVq1U"; // Replace with your actual Trefle API Key

    if (animalClasses.includes(selectedClass)) {
      fetch(
        `https://api.api-ninjas.com/v1/animals?name=${encodeURIComponent(
          selectedClass
        )}`,
        {
          headers: { "X-Api-Key": "4QzVmj4lmooDOFeukjtbrw==zbCUHZjjbiWrqLlD" },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setAnimalData(data[0]);
          fetchImage(selectedClass);
        })
        .catch((error) => {
          console.error("Error fetching animal data:", error);
          setAnimalData(null);
        });
    } else if (plantClasses.includes(selectedClass)) {
      const searchUrl = `https://trefle.io/api/v1/plants/search?q=${encodeURIComponent(
        selectedClass
      )}&token=${apiKey}`;
      fetch(searchUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.data && data.data.length > 0) {
            setAnimalData(data.data[0]); // Directly use the detailed data from the search result
            fetchImage(selectedClass);
          } else {
            console.error("No results found for the query:", selectedClass);
            setAnimalData(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching plant search results:", error);
          setAnimalData(null);
        });
    } else {
      console.error("Unknown class:", selectedClass);
      setAnimalData(null);
    }
  }, []);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderAnimalDetails = (animalData) => {
    if (!animalData) return null;

    return (
      <View>
        <Text style={styles.title}>
          {animalData.name} is a{" "}
          <Text style={styles.bold}>{animalData.characteristics.type}</Text>{" "}
          with a lifespan of approximately{" "}
          <Text style={styles.bold}>{animalData.characteristics.lifespan}</Text>
          .
        </Text>
        <Text style={styles.title}>
          It can reach a top speed of{" "}
          <Text style={styles.bold}>
            {animalData.characteristics.top_speed}
          </Text>{" "}
          and primarily lives in{" "}
          <Text style={styles.bold}>{animalData.characteristics.habitat}</Text>.
        </Text>
        <Text style={styles.title}>
          Its diet consists mainly of{" "}
          <Text style={styles.bold}>{animalData.characteristics.diet}</Text>,
          with{" "}
          <Text style={styles.bold}>
            {animalData.characteristics.favorite_food}
          </Text>{" "}
          being a favorite.
        </Text>
        <Text style={styles.title}>
          Main prey includes{" "}
          <Text style={styles.bold}>
            {animalData.characteristics.main_prey}
          </Text>{" "}
          while its predators are{" "}
          <Text style={styles.bold}>
            {animalData.characteristics.predators}
          </Text>
          .
        </Text>
        <Text style={styles.title}>
          <Text style={styles.bold}>Slogan:</Text> "
          {animalData.characteristics.slogan}"
        </Text>
      </View>
    );
  };

  const renderPlantDetails = (plantData) => {
    if (!plantData) return null;

    // Use main_species data if available, otherwise fallback to top-level data
    const speciesData = plantData.main_species || plantData;

    const commonName = plantData.common_name || speciesData.common_name;
    const scientificName =
      plantData.scientific_name || speciesData.scientific_name;
    const familyName = plantData.family
      ? plantData.family.name
      : speciesData.family;
    const familyCommonName = plantData.family
      ? plantData.family.common_name
      : speciesData.family_common_name;

    let detailsElements = [];

    // Constructing the introduction with common and scientific names
    if (commonName || scientificName) {
      detailsElements.push(
        <Text key="introduction" style={styles.title}>Meet the{" "}
          <Text style={styles.bold}>{commonName || "mysterious plant"}</Text>,
          scientifically known as{" "}
          <Text style={styles.bold}>{scientificName}</Text>.
        </Text>
      );
    }

    // Detailed description of family and genus
    if (familyName || familyCommonName) {
      detailsElements.push(
        <Text key="family" style={styles.text}>
        It belongs to the{" "}
          <Text style={styles.bold}>{familyName || "unknown family"}</Text>,
          commonly referred to as the{" "}
          <Text style={styles.bold}>{familyCommonName || "unknown"}</Text>{" "}
          family.
        </Text>
      );
    }

    if (plantData.genus && plantData.genus.name) {
      detailsElements.push(
        <Text key="member" style={styles.text}>
          This plant is a member of the{" "}
          <Text style={styles.bold}>{plantData.genus.name}</Text> genus.
        </Text>
      );
    }

    // Bibliographic data
    if (speciesData.bibliography) {
      detailsElements.push(
        <Text key="editor" style={styles.text}>
          First documented by{" "}
          <Text  style={styles.bold}>
            {speciesData.author || "an unknown author"}
          </Text>{" "}
          in <Text style={styles.bold}>{speciesData.year}</Text>, as per{" "}
          <Text style={styles.bold}>{speciesData.bibliography}</Text>.
        </Text>
      );
    }

    // Information about the distribution and conservation status
    if (speciesData.distribution && speciesData.distribution.global) {
      detailsElements.push(
        <Text  key="details" style={styles.text}>
          Its natural habitat spans{" "}
          <Text style={styles.bold}>{speciesData.distribution.global}</Text>.
        </Text>
      );
    }

    if (speciesData.flower || speciesData.foliage) {
      detailsElements.push(
        <Text key="known" style={styles.text}>
          Known for its {speciesData.flower ? "beautiful " + speciesData.flower.color + " flowers" : "lush foliage"}, this plant adds aesthetic value to its surroundings.
        </Text>
      );
    }
  
    if (speciesData.edible === false) {
      detailsElements.push(
        <Text  key="edible" style={styles.text}>
          Despite its beauty, it is <Text style={styles.bold}>not edible</Text> and should be admired only for its visual appeal.
        </Text>
      );
    }
  
    if (speciesData.observations) {
      detailsElements.push(
        <Text key="history"  style={styles.text}>
          Historically noted in regions like <Text style={styles.bold}>{speciesData.observations}</Text>, this plant has been a subject of interest among botanists and nature enthusiasts.
        </Text>
      );
    }

    return <View style={styles.container}>{detailsElements}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.todayInfo}>
        Today's class is <Text style={styles.appName}>{dailyClass}</Text>!{" "}
        {"\n"}
        Date: {formattedDate}
      </Text>
      {plantClasses.includes(dailyClass)
        ? renderPlantDetails(animalData) // Assuming plant data is stored in the same state
        : renderAnimalDetails(animalData)}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    padding: 15,
    backgroundColor: "#FAFAFA", // Lighter, off-white background
  },
  appName: {
    textDecorationLine: "underline",
    color: "#4CAF50", // A fresh green, more vibrant
    fontWeight: "bold",
    fontSize: 20, // Larger font size for emphasis
  },
  todayInfo: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#555", // Slightly lighter than the main text
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24, // Increased line height for readability
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
  },
});

export default HomeScreen;

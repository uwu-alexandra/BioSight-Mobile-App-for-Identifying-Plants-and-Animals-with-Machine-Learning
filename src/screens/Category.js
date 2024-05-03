import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Animated,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../Colors";
import { auth, db } from "../../firebase.config";
import Spinner from "react-native-loading-spinner-overlay";
import animalsData from "../../backend/class_names_animals.json";
import plantsData from "../../backend/class_names_plants.json";

const { width } = Dimensions.get("window");

const CategoryScreen = ({ route }) => {
  const { category } = route.params;
  const [classes, setClasses] = useState([]);
  const [sortMethod, setSortMethod] = useState("alphabetical");
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [slideshowVisible, setSlideshowVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const user = auth.currentUser;

  useEffect(() => {
    fetchImages();
  }, [category, user]);

  const fetchImages = async () => {
    if (!user || !user.uid) return;

    setLoadingVisible(true);
    fadeOut();

    const userImagesRef = db
      .collection("bestiary")
      .doc(user.uid)
      .collection("sights");

    try {
      const snapshot = await userImagesRef.get();
      fadeIn();
      if (snapshot.empty) {
        console.log("No matching documents.");
        setTimeout(() => setLoadingVisible(false), 3000);
        return;
      }

      const imageData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const className = data.predictedClassName;
        const imageUri = data.imageUri;
        if (!imageData[className]) imageData[className] = [];
        imageData[className].push(imageUri);
      });

      const data =
        category.toLowerCase() === "animals" ? animalsData : plantsData;
      let updatedClasses = data.map((cls) => ({
        name: cls,
        thumbnails: imageData[cls] || [],
      }));

      sortClasses(updatedClasses);
      setTimeout(() => setLoadingVisible(false), 3000);
    } catch (error) {
      console.error("Error fetching images:", error);
      fadeIn();
      setTimeout(() => setLoadingVisible(false), 3000);
    }
  };

  const sortClasses = (classes) => {
    let sortedClasses = [...classes];
    switch (sortMethod) {
      case "discovered":
        sortedClasses.sort((a, b) => b.thumbnails.length - a.thumbnails.length);
        break;
      case "undiscovered":
        sortedClasses.sort((a, b) => a.thumbnails.length - b.thumbnails.length);
        break;
      case "alphabetical":
        sortedClasses.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sortedClasses.sort((a, b) => b.thumbnails.length - a.thumbnails.length);
    }
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setClasses(sortedClasses));
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (classes.length) {
      sortClasses(classes); // Re-sort when sort method changes
    }
  }, [sortMethod]);

  const totalClasses =
    category.toLowerCase() === "animals"
      ? animalsData.length
      : plantsData.length;
  const discoveredClasses = classes.filter(
    (cls) => cls.thumbnails.length > 0
  ).length;

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + currentImages.length) % currentImages.length
    );
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.item, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => {
          if (item.thumbnails.length === 0) {
            Alert.alert(
              "No Images Available",
              "There are no photos for this category yet! Identify some."
            );
          } else {
            setCurrentImages(item.thumbnails);
            setCurrentImageIndex(0);
            setSlideshowVisible(true);
          }
        }}
      >
        {item.thumbnails.length > 0 ? (
          <Image
            source={{ uri: item.thumbnails[0] }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text>???</Text>
          </View>
        )}
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.summaryText}>
          Discovered {classes.filter((cls) => cls.thumbnails.length > 0).length}{" "}
          out of {totalClasses} available! Keep going:)
        </Text>
        <TouchableOpacity
          onPress={() => setSortModalVisible(true)}
          style={styles.sortButton}
        >
          <Text>Sort: {sortMethod}</Text>
        </TouchableOpacity>
      </View>

      <Spinner
        visible={loadingVisible}
        textContent={"Loading..."}
        textStyle={styles.spinnerText}
        color={colors.focused}
        overlayColor="rgba(255, 255, 255, 0.8)"
      />

      {/* Slideshow Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={slideshowVisible}
        onRequestClose={() => setSlideshowVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              onPress={goToPrevious}
              style={[styles.navButton, styles.leftNavButton]}
            >
              <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.counterText}>
              {currentImageIndex + 1} / {currentImages.length}
            </Text>
            <Image
              source={{ uri: currentImages[currentImageIndex] }}
              style={styles.slideshowImage}
            />

            <TouchableOpacity
              onPress={goToNext}
              style={[styles.navButton, styles.rightNavButton]}
            >
              <AntDesign name="right" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSlideshowVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sorting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalViewSorting}>
            {["alphabetical", "discovered", "undiscovered"].map(
              (method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => {
                    setSortMethod(method);
                    setSortModalVisible(false);
                  }}
                >
                  <Text>{method}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </Modal>

      <FlatList
        data={classes}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.name + index}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    top: 25,
    height: "65%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewSorting: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    padding: 10,
    elevation: 2,
  },
  header: {
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  summaryText: {
    fontSize: 16,
    paddingBottom: 15,
    paddingTop: 10,
  },
  sortButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  list: {
    justifyContent: "space-around",
  },
  item: {
    margin: 5,
    width: (width - 30) / 3,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 0,
  },
  thumbnailPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    textAlign: "center",
    marginTop: 5,
  },
  slideshowImage: {
    width: width - 40,
    height: 300,
    resizeMode: "contain",
    marginHorizontal: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },
  closeButtonText: {
    fontSize: 18,
  },
  counterText: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  navButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  navButtonText: {
    fontSize: 24,
    color: "black",
  },
  leftNavButton: {
    position: "absolute",
    left: 35,
    top: 200,
    zIndex: 1, // necessary to overlay the image
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },
  rightNavButton: {
    position: "absolute",
    right: 35,
    top: 200,
    zIndex: 1, // necessary to overlay the image
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },
});

export default CategoryScreen;

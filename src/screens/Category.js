import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, StyleSheet, View, Text, FlatList,
  TouchableOpacity, Image, Dimensions, Modal, Animated
} from 'react-native';
import { auth, db } from "../../firebase.config";

import animalsData from '../../backend/class_names_animals.json';
import plantsData from '../../backend/class_names_plants.json';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ route }) => {
  const { category } = route.params;
  const [classes, setClasses] = useState([]);
  const [sortMethod, setSortMethod] = useState('alphabetical');
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;  // Initial opacity for images is 1
  const user = auth.currentUser;

  useEffect(() => {
    const fetchImages = async () => {
      if (!user || !user.uid) return;
      fadeOut();  // Start by fading out existing images


      const userImagesRef = db.collection("bestiary").doc(user.uid).collection("sights");
      try {
        const snapshot = await userImagesRef.get();
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }

        const imageData = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          const className = data.predictedClassName;
          const imageUri = data.imageUri;

          if (!imageData[className]) {
            imageData[className] = [];
          }
          imageData[className].push(imageUri);
        });

        const data = category.toLowerCase() === 'animals' ? animalsData : plantsData;
        let updatedClasses = data.map(cls => ({
          name: cls,
          thumbnails: imageData[cls] || []
        }));

        sortClasses(updatedClasses); // Initial sort based on default method
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [category, user]);

  const sortClasses = (classes) => {
    switch (sortMethod) {
      case 'discovered':
        classes.sort((a, b) => b.thumbnails.length - a.thumbnails.length);
        break;
      case 'undiscovered':
        classes.sort((a, b) => a.thumbnails.length - b.thumbnails.length);
        break;
      case 'alphabetical':
      default:
        classes.sort((a, b) => a.name.localeCompare(b.name));
    }
    setClasses(classes);
    fadeIn();  // After sorting, fade the images back in
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };
  useEffect(() => {
    sortClasses([...classes]); // Re-sort when sort method changes
  }, [sortMethod]);

  const totalClasses = category.toLowerCase() === 'animals' ? animalsData.length : plantsData.length;
  const discoveredClasses = classes.filter(cls => cls.thumbnails.length > 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.summaryText}>Discovered {discoveredClasses} out of {totalClasses} available! Keep going :)</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.sortButton}>
          <Text>Sort: {sortMethod}</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {['alphabetical', 'discovered', 'undiscovered'].map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => {
                    setSortMethod(method);
                    setModalVisible(false);
                  }}
                >
                  <Text>{method}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
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

const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={() => {
        console.log('Item selected:', item.name);
    }}
  >
    {item.thumbnails.length > 0 ? (
      <Image source={{ uri: item.thumbnails[0] }} style={styles.thumbnail} />
    ) : (
      <View style={styles.thumbnailPlaceholder}>
        <Text>???</Text>
      </View>
    )}
    <Text style={styles.itemText}>{item.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  summaryText: {
    fontSize: 17,
    paddingBottom: 15,
    paddingTop: 10,
  },
  sortButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  list: {
    justifyContent: 'space-around',
  },
  item: {
    margin: 5,
    width: (width - 30) / 3,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 0,
  },
  thumbnailPlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
});

export default CategoryScreen;

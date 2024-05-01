import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db, auth } from "../../firebase.config";
import { colors } from "../Colors";

const MapScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0]; // Initial opacity is 1 for initial load

  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => callback && callback()); // Execute callback after fade out completes
  };

  const toggleShowMarkers = () => {
    fadeOut(() => {
      setShowAllMarkers((prev) => !prev); // Toggle and refetch markers after fade out completes
    });
  };

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const query = showAllMarkers
          ? db.collectionGroup("markers")
          : db.collection("maps").doc(currentUser.uid).collection("markers");
        const firestoreUnsubscribe = query.onSnapshot(
          (snapshot) => {
            const updatedMarkers = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMarkers(updatedMarkers);
            fadeIn(); // Fade in new markers
          },
          (err) => {
            console.error(`Encountered error: ${err}`);
          }
        );

        return () => firestoreUnsubscribe();
      }
    });

    return () => authUnsubscribe();
  }, [showAllMarkers]); // Effect to refetch markers based on toggle state

  const MarkerDetails = ({ marker, onClose }) => {
    if (!marker) return null;

    // Fetch the currently logged-in user's identifier
    const currentUser = auth.currentUser;
    const currentUserIdentifier = currentUser ? currentUser.email : null; // email is used as the identifier here

    // Format date
    const date = new Date(marker.timestamp);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).format(date);

    // Determine if the current user identified the marker
    const identificationText =
      marker.identifier === currentUserIdentifier
        ? "You identified"
        : `User ${marker.identifier} identified`;

    return (
      <View style={styles.detailsCard}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={styles.detailsText}>
          {identificationText} a {marker.predictedClassName} with{" "}
          {marker.confidence}% confidence
        </Text>
        <Text style={styles.detailsText}>
          Location lat: {parseFloat(marker.latitude).toFixed(3)} & long:{" "}
          {parseFloat(marker.longitude).toFixed(3)}
        </Text>
        <Text style={styles.detailsText}>Date & time: {formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: 45.7489,
          longitude: 21.2087,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        showsUserLocation
        showsMyLocationButton
        minZoomLevel={5}
        maxZoomLevel={20}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={() => handleMarkerPress(marker)}
          >
            <Animated.View style={[styles.marker, { opacity: fadeAnim }]}>
              <Image
                source={{ uri: marker.imageUri }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }}
              />
            </Animated.View>
          </Marker>
        ))}
      </MapView>
      {selectedMarker && (
        <MarkerDetails
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={toggleShowMarkers}
          style={styles.customButton}
        >
          <Text style={styles.buttonText}>
            {showAllMarkers ? "Show only my marks" : "Show all marks"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.focused,
    padding: 3,
    borderRadius: 30,
  },
  buttonContainer: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: colors.focused,
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  detailsCard: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 25,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#ccc",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "black",
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MapScreen;

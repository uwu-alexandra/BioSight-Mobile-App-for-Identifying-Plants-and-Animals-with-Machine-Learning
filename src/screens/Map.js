import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db, auth } from "../../firebase.config";
import { colors } from "../Colors";

const user = auth.currentUser;
const isGuest = user ? user.isAnonymous : false;

//if user is guest identifier=guest, else, is user's email
const userIdentifier = isGuest ? "guest" : user.email;

const MapScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Define handleMarkerPress using useCallback to ensure it doesn't change unless necessary
  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);
    return () => {
      <View style={{padding: 10}}>
        <Text>Marker</Text>
      </View>
    }
  }, []);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    let firestoreUnsubscribe;
    if (user) {
      firestoreUnsubscribe = db
        .collection("maps")
        .doc(user.uid)
        .collection("markers")
        .onSnapshot(
          (snapshot) => {
            const updatedMarkers = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMarkers(updatedMarkers);
          },
          (err) => {
            console.error(`Encountered error: ${err}`);
          }
        );
    }

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, [user]);

  const REGION = {
    latitude: 45.7489,
    longitude: 21.2087,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  const MarkerDetails = ({ marker, onClose }) => {
    if (!marker) return null;

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

    return (
      <View style={styles.detailsCard}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={styles.detailsText}>
          User {userIdentifier} identified a {marker.predictedClassName} with {marker.confidence} confidence
        </Text>
        <Text style={styles.detailsText}>
          Location lat: {parseFloat(marker.latitude).toFixed(3)} & long:{" "}
          {parseFloat(marker.longitude).toFixed(3)}
        </Text>
        <Text style={styles.detailsText}>Time: {formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={REGION}
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
            <View style={styles.marker}>
              <Image
                source={{ uri: marker.imageUri }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }}
              />
            </View>
          </Marker>
        ))}
      </MapView>
      {selectedMarker && (
        <MarkerDetails
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      )}
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
  markerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
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

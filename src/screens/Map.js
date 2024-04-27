import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db, auth } from "../../firebase.config";

const MapScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [user, setUser] = useState(null);

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
              <Text style={styles.markerText}>{marker.predictedClassName}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Semi-transparent background to enhance text visibility
    padding: 2,
    borderRadius: 40,
  },
  markerText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: "center",
  },
});

export default MapScreen;

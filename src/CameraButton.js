import React, { useState, useRef } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import Constants from "expo-constants";
import { Camera, CameraType } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from 'expo-image-manipulator';
import Button from "./components/Button";
import { auth, storage } from "../firebase.config";
import { useEffect } from "react";

export default function CameraButton() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync();
      console.log(data);
      setImage(data.uri);
    }
  };

  // Resize the image to 1000x1000 pixels and compress it to 100% quality
  const resizeImage = async (uri) => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000, height: 1000 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      return resizedImage.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return null;
    }
  };

  // Save the picture to the device's gallery and upload it to Firebase Storage
  const savePicture = async () => {
    if (!image) {
      alert("No image to save!");
      return;
    }
    const resizedImageUri = await resizeImage(image);
    try {
      const asset = await MediaLibrary.createAssetAsync(resizedImageUri);
      const user = auth.currentUser;
      const isGuest = user ? user.isAnonymous : false;
      const userId = user.uid;
      const response = await fetch(resizedImageUri);
      const blob = await response.blob();
      // Save the image to folder images/guests for guests or images/users/{userId} for registered users
      const folderPath = isGuest ? `images/guests` : `images/users/${userId}`;
      const storageRef = storage.ref(`${folderPath}/${asset.filename}`);
      const snapshot = await storageRef.put(blob);
      const imageUrl = await snapshot.ref.getDownloadURL();
      // Reset the image state
      setImage(null);
      return imageUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error", error.message);
      return null;
    }
  };

  // Send the image to the server for identification
  const sendImageToServer = async (fileUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    try {
      const response = await fetch('https://cow-splendid-cicada.ngrok-free.app/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Server response:", jsonResponse);
      } else {
        const errorResponse = await response.text();
        throw new Error(`Failed to send file, status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending file to server:", error);
      alert("Error sending file to server:", error.message);
    }
  };

  // Call the savePicture and sendImageToServer functions
  const saveAndIdentifyPicture = async () => {
    const imageUrl = await savePicture();
    if (imageUrl) {
      await sendImageToServer(imageUrl);
    } else {
      console.log("Failed to get the image URL, not sending to server.");
    }
  };

  // If the user denies the camera permission, show a message
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <Camera
          style={styles.camera}
          type={type}
          ref={cameraRef}
          flashMode={flash}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 30,
            }}
          >
            <Button
              title=""
              icon="retweet"
              onPress={() => {
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                );
              }}
            />
            <Button
              onPress={() =>
                setFlash(
                  flash === Camera.Constants.FlashMode.off
                    ? Camera.Constants.FlashMode.on
                    : Camera.Constants.FlashMode.off
                )
              }
              icon="flash"
              color={flash === Camera.Constants.FlashMode.off ? "gray" : "#fff"}
            />
          </View>
        </Camera>
      ) : (
        <Image
          source={{ uri: image }}
          style={styles.camera}
        />
      )}

      <View style={styles.controls}>
        {image ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 50,
            }}
          >
            <Button
              title="Refă"
              onPress={() => setImage(null)}
              icon="retweet"
            />
            <Button
              title="Identifică"
              onPress={saveAndIdentifyPicture}
              icon="check"
            />
          </View>
        ) : (
          <Button
            onPress={takePicture}
            icon="camera"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#000",
    padding: 8,
  },
  controls: {
    flex: 0.5,
  },
  button: {
    height: 40,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relatove",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#E9730F",
    marginLeft: 10,
  },
  camera: {
    flex: 5,
    borderRadius: 20,
  },
  topControls: {
    flex: 1,
  },
});

import React, { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Constants from "expo-constants";
import { Camera, CameraType } from "expo-camera";
import Spinner from "react-native-loading-spinner-overlay";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from "expo-image-manipulator";
import CustomButton from "./components/Button";
import { auth, storage } from "../firebase.config";
import { useEffect } from "react";
import { colors } from "./Colors";
import { AntDesign } from "@expo/vector-icons";

export default function CameraButton() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [spinner, setSpinner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
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
  const savePicture = async (fileUri, predictedClassName) => {
    if (typeof fileUri !== "string") {
      console.error("Invalid file URI:", fileUri);
      return null;
    }

    const resizedImageUri = await resizeImage(fileUri);
    try {
      const asset = await MediaLibrary.createAssetAsync(resizedImageUri);
      const user = auth.currentUser;
      const isGuest = user ? user.isAnonymous : false;
      const userId = user.uid;
      const response = await fetch(resizedImageUri);
      const blob = await response.blob();

      // Get the current timestamp
      const timestamp = Date.now();
      // Construct the image name with the predicted class name and timestamp
      const imageName = `${predictedClassName}_${timestamp}.jpg`;

      // Save the image to folder images/guests for guests or images/users/{userId} for registered users
      const folderPath = isGuest ? `images/guests` : `images/users/${userId}`;
      const storageRef = storage.ref(`${folderPath}/${imageName}`);
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
    if (typeof fileUri !== "string") {
      console.error("Invalid file URI:", fileUri);
      return null;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: "upload.jpg",
    });
    try {
      const response = await fetch(
        "https://cow-splendid-cicada.ngrok-free.app/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Server response:", jsonResponse);

        return jsonResponse; // Return the entire JSON response
      } else {
        const errorResponse = await response.text();
        throw new Error(`Failed to send file, status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending file to server:", error);
      alert("Error sending file to server:", error.message);
      return null;
    }
  };

  const saveAndIdentifyPicture = async () => {
    if (image) {
      setSpinner(true);
      const serverResponse = await sendImageToServer(image);
      if (serverResponse) {
        const { predicted_class, confidence, top3 } = serverResponse;
        const imageUrl = await savePicture(image, predicted_class);
        if (imageUrl) {
          setModalContent({
            imageUrl,
            predictedClassName: predicted_class,
            confidence,
            top3,
          });
          setModalVisible(true);
        }
      }
      setSpinner(false);
    } else {
      console.log("No image available to send.");
    }
  };

  // If the user denies the camera permission, show a message
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={spinner}
        textContent={"Loading identification..."}
        textStyle={styles.spinnerTextStyle}
        color={colors.focused}
        overlayColor="rgba(255, 255, 255, 0.8)"
      />
      {hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <>
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
                <CustomButton
                  title=""
                  icon="retweet"
                  onPress={() => {
                    setType(
                      type === CameraType.back
                        ? CameraType.front
                        : CameraType.back
                    );
                  }}
                />
                <CustomButton
                  onPress={() =>
                    setFlash(
                      flash === Camera.Constants.FlashMode.off
                        ? Camera.Constants.FlashMode.on
                        : Camera.Constants.FlashMode.off
                    )
                  }
                  icon="flash"
                  color={
                    flash === Camera.Constants.FlashMode.off ? "gray" : "#fff"
                  }
                />
              </View>
            </Camera>
          ) : (
            <Image source={{ uri: image }} style={styles.camera} />
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
                <CustomButton
                  title="Refă"
                  onPress={() => setImage(null)}
                  icon="retweet"
                />
                <CustomButton
                  title="Identifică"
                  onPress={saveAndIdentifyPicture}
                  icon="check"
                />
              </View>
            ) : (
              <CustomButton
                title={"Take Picture"}
                onPress={takePicture}
                icon={"camera"}
              />
            )}
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        propagateSwipe={true}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.buttonContent}>
                  <AntDesign name="closecircleo" size={24} color="white" />
                  <Text style={styles.buttonText}>Close</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.modalText}>
                We are {" "}
                <Text style={styles.boldText}>{modalContent.confidence}</Text>
                {"\n"}confident that this is a{" "}
                <Text style={styles.boldText}>
                  {modalContent.predictedClassName}
                </Text>
              </Text>
              <Image
                source={{ uri: modalContent.imageUrl }}
                style={styles.modalImage}
              />
              <Text style={styles.modalText}>
                It also looks like a {"\n"}
                {modalContent.top3 &&
                  modalContent.top3
                    .filter(
                      (item) =>
                        item.class_name !== modalContent.predictedClassName
                    ) // Filter out the primary prediction
                    .map((item, index, arr) => {
                      // Check if the current item is the last in the array
                      const isLast = index === arr.length - 1;
                      return (
                        <Text key={index}>
                          <Text style={styles.boldText}>{item.class_name}</Text>
                          {!isLast ? " or a " : " :)"} 
                        </Text>
                      );
                    })}
              </Text>
              <Text style={styles.boldText}>
              {"\n"}{"\n"} Here are some interesting facts{"\n"} about a {modalContent.predictedClassName}:
                 </Text>
              <Text style={styles.modalText}>
                The rose, a symbol of love and beauty, wields more than  efjust its enchanting looks. 
                This popular bloom is a horticultural marvel with a history spanning 5,000 years. 
                Beyond its ornamental charm, the rose has practical uses; its petals flavor foods,
                 its hips are vitamin-rich, and its oils are treasured in perfumery
              </Text>

            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#000",
    padding: 8,
  },
  controls: {
    flex: 0.5,
  },
  camera: {
    flex: 5,
  },
  spinnerTextStyle: {
    color: colors.focused,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 75,
    paddingBottom: 75,
  },
  modalView: {
    backgroundColor: colors.focused,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    marginTop: 9,
    shadowColor: colors.focused,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
    shadowOffset: {
      width: 0,
    },
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: "white",
  },
  buttonContent: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    top: -30,
    right: -130,
    color: "white",
  },
  buttonText: {
    marginLeft: 5,
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  boldText: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: 20,
  },
});

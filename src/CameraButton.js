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
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import CustomButton from "./components/Button";
import { auth, storage, db } from "../firebase.config";
import { useEffect } from "react";
import { colors } from "./Colors";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

export default function CameraButton() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [spinner, setSpinner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [showFunFacts, setShowFunFacts] = useState(false);
  const user = auth.currentUser;
  const userId = user.uid;
  const isGuest = user ? user.isAnonymous : false;

  // Function to request camera and location permissions
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
      setHasLocationPermission(locationStatus.status === "granted");
    })();
  }, []);

  const handleShowFunFacts = () => {
    fetchOpenAIData(modalContent.predictedClassName); // Trigger fetching fun facts when user presses the button
    setShowFunFacts(true);
  };

    // Function to fetch data from OpenAI
    const fetchOpenAIData = async (predictedClassName) => {
      const text = `In 125 tokens, tell me something interesting about ${predictedClassName}.`;
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${'sk-proj-'}` ,
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
        if (response.ok) {
          setModalContent(prevState => ({
            ...prevState,
            funFacts: data.choices[0].message.content.trim() || 'No fun facts found'
          }));
        } else {
          throw new Error(`Failed to fetch fun facts: ${data.error?.message}`);
        }
      } catch (error) {
        console.error('Error fetching fun facts:', error);
        setModalContent(prevState => ({
          ...prevState,
          funFacts: `Failed to fetch fun facts: ${error.message}`
        }));
      }
    };

  // Function to go back to the first screen
  const handleGoBackUp = () => {
    setShowFunFacts(false);
  };

  // Function to take a picture with the camera
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
    // Resize the image before saving it
    const resizedImageUri = await resizeImage(fileUri);
    try {
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
    // Create a FormData object to send the image as a file
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
        // Return the entire JSON response
        return jsonResponse;
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
      try {
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
            if (user && !user.isAnonymous) {
              // Check if user is logged in and not a guest
              const location = await Location.getCurrentPositionAsync({});
              const userEmail = isGuest ? `guest` : user.email;
              const now = new Date(); // Get current date and time
              const markerData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                imageUri: imageUrl,
                predictedClassName: predicted_class,
                confidence,
                timestamp:  now.toISOString(),
                identifier: userEmail,
              };
              const sightData = {
                imageUri: imageUrl,
                predictedClassName: predicted_class,
              };

              // Use a specific Firestore path based on user's UID
              try {
                console.log("Trying to upload marker data:", markerData);
                await db
                  .collection(`maps/${user.uid}/markers`)
                  .add(markerData);
                console.log("Uploaded marker data");
              } catch (error) {
                console.error("Failed to upload marker:", error);
                alert("Failed to upload marker.");
              }

              try {
                console.log("Trying to upload sight data:", sightData);
                await db
                  .collection(`bestiary/${user.uid}/sights`)
                  .add(sightData);
                console.log("Uploaded sight data");
              } catch (error) {
                console.error("Failed to upload sight:", error);
                alert("Failed to upload sight.");
              }
              setModalVisible(true);
            }
            setModalVisible(true);
          }
        }
      } catch (error) {
        console.error("Error during identification or saving:", error.message);
        alert("Failed to process the image.");
      }
      setSpinner(false); // Ensure spinner is turned off after all operations
    } else {
      console.log("No image available to send.");
      setSpinner(false); // Ensure spinner is turned off if there is no image
    }
  };  

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
      ) : hasLocationPermission === false ? (
        <Text>No access to location</Text>
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
                style={[
                  styles.closeButton,
                  { position: "absolute", top: 10, right: 10 },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.buttonContent}>
                  <AntDesign name="closecircleo" size={24} color="white" />
                  <Text style={styles.buttonText}>Close</Text>
                </View>
              </TouchableOpacity>
              {!showFunFacts ? (
                // First screen content here
                <View>
                  {/* ... First Screen Content */}
                  <Text style={styles.modalText}>
                    We are{" "}
                    <Text style={styles.boldText}>
                      {modalContent.confidence}{" "}
                    </Text>
                    confident that this is a{" "}
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
                              <Text style={styles.boldText}>
                                {item.class_name}
                              </Text>
                              {!isLast ? " or a " : " :)"}
                            </Text>
                          );
                        })}
                  </Text>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={handleShowFunFacts}
                  >
                    <FontAwesome name="arrow-down" size={24} color="white" />
                    <Text style={styles.buttonText}>Interesting facts</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Second screen content here
                <View>
                  {/* ... Second Screen Content */}
                  <Text style={styles.boldText}>
                    {"\n"}Here are some interesting facts about a{" "}
                    {modalContent.predictedClassName}:
                  </Text>
                  <Text style={styles.modalDetailsText}>
                  {"\n"}{modalContent.funFacts}

                  </Text>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBackUp}
                  >
                    <View style={styles.buttonContent}>
                      <FontAwesome name="arrow-up" size={24} color="white" />
                      <Text style={styles.buttonText}>Go back up</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
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
    paddingTop: 43,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 80,
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
    top: 60,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: "white",
    top: 60,
  },
  buttonContent: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    top: 10,
    right: 30,
    color: "white",
  },
  buttonText: {
    marginLeft: 5,
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    flexDirection: "row",
  },
  detailsButton: {
    paddingBottom: 110,
    paddingTop: 30,
    elevation: 2,
    top: 70,
    right: -65,
    flexDirection: "row",
  },
  backButton: {
    paddingBottom: 92,
    elevation: 2,
    top: 50,
    right: -30,
  },
  boldText: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: 20,
  },
  modalDetailsText: {
    textAlign: "justify",
    fontSize: 20,
    color: "white",
  },
});

import { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from 'expo-media-library';

const cameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  return { hasPermission, type, setType, camera, setCamera, image, setImage };
};

export default cameraPermission;

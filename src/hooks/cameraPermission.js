import { useState, useEffect } from "react";
import { Camera } from "expo-camera";

const cameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(null);
  // const [type, setType] = useState(Camera.Constants.Type.back);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  return { hasPermission /*, type, setType */ };
};

export default cameraPermission;

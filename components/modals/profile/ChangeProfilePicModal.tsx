import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { Foundation, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangeProfilePicModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state: RootState) => state.auth.bioData);

  const handleImagePick = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      // Launch image picker
      const pickerResult: any = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1], // 1:1 aspect ratio for square images
        quality: 1,
      });

      console.log({ seeFile: pickerResult?.assets });

      if (!pickerResult?.canceled) {
        // Set the selected image URI to state
        setImage(pickerResult?.assets[0]?.uri); // This was missing previously
      }
    } else {
      alert("Permission to access media library is required!");
    }
  };

  const handleFileUpload = async () => {
    setLoading(true);
    if (!image) {
      Toast.show({
        type: 'error',
        text1: 'Please select an image first',
      });
      return;
    }

    const formData = new FormData();
    const file: any = {
      uri: image,
      name: `profile_${userProfile.id}.jpg`, // You can adjust the naming convention
      type: 'image/jpeg', // Set the appropriate mime type for the image
    };

    formData.append('profilePic', file);
    try {
      const res = await api.put(`/user/uploadPicture/${userProfile.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res?.data?.success) {
        router.replace({
          pathname: "/viewprofile",
          params:{id:userProfile.id}
        });
        Toast.show({
          type: 'success',
          text1: 'Picture updated',
        });
        setLoading(false);
        onClose()
      } else {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'File upload failed',
          text2: res?.data?.message || 'Something went wrong!',
        });
      }

    } catch (error: any) {
      console.log({ seeErrorBreak: error });
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Failed to upload',
        text2: error?.message || 'Network error',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={{ width: "100%", justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.title}>Update Profile Picture</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.subtitle}>Select a picture from your gallery.</Text>
            <View style={{ width: "100%", alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
              {image ? (
                <TouchableOpacity onPress={handleImagePick} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <Text style={styles.imageText}>Selected</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleImagePick} style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="add-a-photo" size={28} />
                  <Text style={styles.addPhotoText}>Add a photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: image ? "#000" : "#ccc" }]}
            onPress={handleFileUpload}
            disabled={!image||loading} // Disable button if no image is selected
          >
            <Text style={styles.buttonText}>{loading ? <ActivityIndicator/> : "Upload"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: "16@ms",
    padding: "20@ms",
    alignItems: "center",
  },
  body: {
    width: "100%",
    marginTop: "25@ms",
  },
  title: {
    fontSize: "18@ms",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "14@ms",
    color: "#666",
    marginBottom: "20@ms",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "12@ms",
    borderRadius: "8@ms",
    alignItems: "center",
    marginVertical: "8@ms",
  },
  buttonText: {
    color: "#fff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
  imagePreview: {
    width: 60, // Adjust the size of the image
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  imageText: {
    fontSize: "14@ms",
    marginLeft: 10,
    color: "#666",
  },
  addPhotoText: {
    fontSize: "14@ms",
    marginLeft: 10,
    color: "#0078AF", // Customize the color of the text
  },
});

export default ChangeProfilePicModal;
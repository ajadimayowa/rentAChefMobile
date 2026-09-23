import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ReusableButton from "@/components/buttons/ReusableButton";
import ProfileEditSheet from "./ProfileEditSheet";

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
    <ProfileEditSheet
      visible={visible}
      onClose={onClose}
      title="Update Profile Picture"
      icon={<Ionicons name="camera-outline" size={16} color="#5D3C17" />}
      iconBg="#F4EBDD"
    >
      <Text style={styles.subtitle}>Select a picture from your gallery.</Text>

      <TouchableOpacity style={styles.pickerArea} onPress={handleImagePick} activeOpacity={0.7}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholderCircle}>
            <MaterialIcons name="add-a-photo" size={24} color="#8A7B6A" />
          </View>
        )}
        <Text style={styles.pickerText}>{image ? "Change photo" : "Choose a photo"}</Text>
      </TouchableOpacity>

      <ReusableButton
        style={{ marginTop: 20 }}
        onPress={handleFileUpload}
        loading={loading}
        disabled={!image}
        title="Upload"
      />
    </ProfileEditSheet>
  );
};

const styles = ScaledSheet.create({
  subtitle: {
    fontSize: "13@ms",
    color: "#847564",
    marginBottom: "18@ms",
  },
  pickerArea: {
    width: "100%",
    alignItems: "center",
    paddingVertical: "16@ms",
  },
  imagePreview: {
    width: "88@ms",
    height: "88@ms",
    borderRadius: "999@ms",
    backgroundColor: "#F8F1E8",
  },
  placeholderCircle: {
    width: "88@ms",
    height: "88@ms",
    borderRadius: "999@ms",
    backgroundColor: "#F8F1E8",
    borderWidth: 1,
    borderColor: "#EFE3D7",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerText: {
    marginTop: "10@ms",
    fontSize: "13@ms",
    fontWeight: "600",
    color: "#5D3C17",
  },
});

export default ChangeProfilePicModal;
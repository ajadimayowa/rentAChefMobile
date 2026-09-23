import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { Foundation, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Formik } from "formik";
import * as Yup from "yup";
import FormInput from "@/components/FormInput";
import ReusableButton from "@/components/buttons/ReusableButton";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const UpdateHealthInfoModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state: RootState) => state.auth.bioData);

  const updateHealthInfo = async (values: any) => {
    console.log({ sendign: values })
    setLoading(true);
    try {
      const res = await api.put(`/user/updateHealthInformation/${userProfile.id}`, {healthDetails:values?.healthDetails,allergies:[values?.allergies]});

      if (res?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
        });

        onClose();
        router.navigate('/(dashboard)')
      } else {
        Toast.show({
          type: "error",
          text1: "User already exists",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const RegisterSchema = Yup.object().shape({
    healthDetails: Yup.string()
      .trim()
      .min(3, "Description must be at least 3 characters")
      .required("Description is required"),

    allergies: Yup.string().required("Allergies is required"),
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Health Information</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Formik
              initialValues={{
                healthDetails: '',
                allergies: ''
              }}
              validationSchema={RegisterSchema}
              onSubmit={updateHealthInfo}
            >
              {({ handleSubmit }) => (
                <>
                  <FormInput
                  type="textarea"
                    id="healthDetails"
                    label="Health information"
                    placeholder="Enter a brief description"
                  />
                  <FormInput
                    id="allergies"
                    label="Enter allergy"
                    placeholder="i.e wallnut"
                  />
                   {/* <View style={{flexDirection:'row',gap:2, width:'100%',alignItems:'center',justifyContent:'space-between'}}>
                    
                  <TouchableOpacity style={{alignItems:'center'}}>
                    <Ionicons size={16}  name="save"/>
                  </TouchableOpacity>
                   </View> */}
                  <ReusableButton
                    style={{ marginTop: 20 }}
                    onPress={handleSubmit}
                    loading={loading}
                    title="Save"
                  />
                </>
              )}
            </Formik>
          </ScrollView>
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
    width: "90%",
    maxHeight: "85%",             // ✅ prevents full screen overflow
    backgroundColor: "#fff",
    borderRadius: "16@ms",
    padding: "20@ms",
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
  signupText: {
    textAlign: "center",
    fontSize: "13@s",
    marginTop: "20@vs",
  },
  signupLink: {
    color: "#EA7052",
  },
  header: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  errorText: {
    color: "red",
    fontSize: "12@s",
    marginTop: 4,
    marginBottom: 6,
  },
});

export default UpdateHealthInfoModal;
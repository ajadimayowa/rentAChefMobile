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
import { Formik } from "formik";
import * as Yup from "yup";
import FormInput from "@/components/FormInput";
import ReusableButton from "@/components/buttons/ReusableButton";
import useLocation from "@/hooks/useLocation";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const UpdateAddressInfoModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const { long, lat, error, isLoading } = useLocation();

  const updateLocation = async (values: any) => {
    console.log({ sendign: values })
    setLoading(true);
    try {
      const res = await api.put(`/user/updateLocation/${userProfile.id}`, values);

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
    state: Yup.string()
      .required("Full name is required"),

    city: Yup.string().required("Gender is required"),
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Biodata</Text>
            <TouchableOpacity onPress={onClose}>
              <Foundation size={24} name="x-circle" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Formik
              initialValues={{
                state: "",
                city: "",
                home:"",
                office:"",
                long:long,
                lat:lat
              }}
              validationSchema={RegisterSchema}
              onSubmit={updateLocation}
            >
              {({ handleSubmit,values }) => (
                <>
                <FormInput
                                  type="textarea"
                                    id="home"
                                    label="Home Address"
                                    placeholder="Enter home address"
                                  />
                
                <FormInput
                                  type="textarea"
                                    id="office"
                                    label="Office Address"
                                    placeholder="Enter office address"
                                  />
                <FormInput
                    id="state"
                    label="State"
                    type="select"
                    placeholder="Select State"
                    options={[
                      { label: "Lagos", value: "Lagos" },
                      { label: "Abuja", value: "Abuja" },
                      { label: "Port Harcourt", value: "Port Harcourt" }
                    ]}
                  />

                  {values.state &&<FormInput
                    id="city"
                    label="City"
                    type="select"
                    placeholder="Select City"
                    options={[
                      { label: "Eti-Osa", value: "Eti-Osa" },
                      { label: "Ikoyi", value: "Ikoyi" },
                      { label: "Lekki", value: "Lekki" }
                    ]}
                  />}

                  

                  <ReusableButton
                    style={{ marginTop: 20 }}
                    onPress={handleSubmit}
                    loading={loading}
                    title="Update"
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

export default UpdateAddressInfoModal;
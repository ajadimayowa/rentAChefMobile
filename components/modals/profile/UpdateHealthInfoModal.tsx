import React, { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Formik } from "formik";
import * as Yup from "yup";
import FormInput from "@/components/FormInput";
import ReusableButton from "@/components/buttons/ReusableButton";
import ProfileEditSheet from "./ProfileEditSheet";

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
    <ProfileEditSheet
      visible={visible}
      onClose={onClose}
      title="Update Health Information"
      icon={<MaterialCommunityIcons name="heart-pulse" size={16} color="#2E5D49" />}
      iconBg="#E7F3EA"
    >
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
            <ReusableButton
              style={{ marginTop: 20 }}
              onPress={handleSubmit}
              loading={loading}
              title="Save"
            />
          </>
        )}
      </Formik>
    </ProfileEditSheet>
  );
};

export default UpdateHealthInfoModal;
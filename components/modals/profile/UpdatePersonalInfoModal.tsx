import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

const UpdatePersonalInfoModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state: RootState) => state.auth.bioData);

  const updateProfile = async (values: any) => {
    console.log({sendign:values})
    setLoading(true);
    try {
      const res = await api.put(`/user/updateBiodata/${userProfile.id}`, values);

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
    fullName: Yup.string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .required("Full name is required"),

    gender: Yup.string().required("Gender is required"),

    phoneNumber: Yup.string()
      .matches(/^\d+$/, "Phone number must contain only digits")
      .min(8, "Phone number must be at least 8 digits")
      .required("Phone number is required"),

    birthDate: Yup.string().required("Date of birth is required"),

    maritalStatus: Yup.string().required("Marital status is required"),
  });

  return (
    <ProfileEditSheet
      visible={visible}
      onClose={onClose}
      title="Update Personal Information"
      icon={<Ionicons name="person-outline" size={16} color="#5D3C17" />}
      iconBg="#F4EBDD"
    >
      <Formik
        initialValues={{
          fullName: "",
          gender: "",
          phoneNumber: "",
          birthDate: "",
          maritalStatus: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={updateProfile}
      >
        {({ handleSubmit }) => (
          <>
            <FormInput
              id="fullName"
              label="Full Name"
              placeholder="Full name"
            />

            <FormInput
              id="phoneNumber"
              label="Phone Number"
              type="number"
              placeholder="Phone number"
            />

            <FormInput
              id="gender"
              label="Gender"
              type="select"
              placeholder="Select Gender"
              options={[
                { label: "Male", value: "m" },
                { label: "Female", value: "f" },
              ]}
            />

            <FormInput
              id="maritalStatus"
              label="Marital Status"
              type="select"
              placeholder="Select Marital Status"
              options={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Divorced", value: "Divorced" },
                { label: "Widowed", value: "Widowed" },
              ]}
            />

            <FormInput
              id="birthDate"
              label="Date of Birth"
              type="date"
              placeholder="Select Date"
            />

            <ReusableButton
              style={{ marginTop: 20 }}
              onPress={handleSubmit}
              loading={loading}
              title="Update"
            />
          </>
        )}
      </Formik>
    </ProfileEditSheet>
  );
};

export default UpdatePersonalInfoModal;
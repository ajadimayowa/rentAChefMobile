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

const UpdateNOKInfoModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state: RootState) => state.auth.bioData);

  const updateProfile = async (values: any) => {
    console.log({sendign:values})
    setLoading(true);
    try {
      const res = await api.put(`/user/updateNok/${userProfile.id}`, values);

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

    relationship: Yup.string().required("Gender is required"),

    phone: Yup.string()
      .matches(/^\d+$/, "Phone number must contain only digits")
      .min(8, "Phone number must be at least 8 digits")
      .required("Phone number is required")
  });

  return (
    <ProfileEditSheet
      visible={visible}
      onClose={onClose}
      title="Update Next of Kin"
      icon={<Ionicons name="people-outline" size={16} color="#5B3A78" />}
      iconBg="#F1E7F6"
    >
      <Formik
        initialValues={{
          fullName: "",
          relationship: "",
          phone: ""
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
              id="phone"
              label="Phone Number"
              type="number"
              placeholder="Phone number"
            />

            <FormInput
              id="relationship"
              type="select"
              placeholder="Select Relationship"
              options={[
                { label: "Husband", value: "Husband" },
                { label: "Wife", value: "Wife" },
                { label: "Sibling", value: "Sibling" },
                { label: "Father", value: "Father" },
                { label: "Mother", value: "Mother" },
              ]}
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

export default UpdateNOKInfoModal;
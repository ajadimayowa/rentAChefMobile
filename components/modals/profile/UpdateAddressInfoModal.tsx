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
import useLocation from "@/hooks/useLocation";
import ProfileEditSheet from "./ProfileEditSheet";

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
    <ProfileEditSheet
      visible={visible}
      onClose={onClose}
      title="Update Address Information"
      icon={<Ionicons name="location-outline" size={16} color="#1F456E" />}
      iconBg="#E5EEF8"
    >
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
    </ProfileEditSheet>
  );
};

export default UpdateAddressInfoModal;
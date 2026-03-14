import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { router, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import { Ionicons } from "@expo/vector-icons";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const ResetPasswordSchema = Yup.object().shape({
  otp: Yup.string().length(6, "Enter 6-digit code").required("OTP is required"),
  newPassword: Yup.string()
    .min(6, "At least 6 characters")
    .matches(/[A-Z]/, "Must contain one uppercase letter")
    .matches(/[!@#$%^&*]/, "Must contain at least one special character")
    .required("Password required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your password"),
});

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [showPass, setShowPass] = useState(false)
  const inputs = useRef<TextInput[]>([]);

  const navigation = useNavigation();
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [securePass, setSecurePass] = useState(true)


  const handleSetNewPassword = async (val: any) => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    console.log({ email: email, ...val })
    setLoading(true)
    const payload = {
      "email": email,
      "otp": val?.otp,
      "newPassword": val?.newPassword
    }
    try {
      const res = await api.post('/auth/reset-password-with-otp', payload)
      console.log({ seeRes: res?.data })

      if (res?.data?.success) {
        console.log("Reset password data:", val);
        router.push("/login");
        Toast.show({
          type: 'success',
          text1: 'Password changed!',
          text2: 'Your password has been updated'
        });
        setLoading(false)
      } else {

        console.log({ seeAfter: res })
        setLoading(false)
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res?.data.message || 'Failed to change password',
        });

      }

    } catch (error: any) {
      console.log({ seeErrorBreak: error })
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.message || 'Error changing password',
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <ImageBackground
        source={require("../assets/images/header-fruits.png")}
        resizeMode="cover"
        style={{ padding: 20, height: 200, justifyContent: "flex-start" }}
      >
        <SafeAreaView style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ReusableButton
          style={{ width: 100 }}
          onPress={() => router.back()}
          iconLeft={"chevron-back"}
          extStyle={{ width: "50%", padding: 0, color: "#000" }}
          type="pressableText"
          title="Go Back"
        />
        </SafeAreaView>
      </ImageBackground>

      {/* Form Section */}
      <View style={{ width: "100%", padding: 20 }}>
        <Text style={styles.title}>Enter the code sent to:</Text>
        <Text style={styles.email}>{email}</Text>

        <Formik
          initialValues={{ otp: "", newPassword: "", confirmPassword: "" }}
          validationSchema={ResetPasswordSchema}
          onSubmit={(values) => handleSetNewPassword(values)}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              {/* OTP */}
              <TextInput
                placeholder="6-digit OTP code"
                style={styles.input}
                value={values.otp}
                onChangeText={handleChange("otp")}
                onBlur={handleBlur("otp")}
                keyboardType="number-pad"
                maxLength={6}
              />
              {touched.otp && errors.otp && (
                <Text style={styles.error}>{errors.otp}</Text>
              )}

              <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* New Password */}
                <TextInput
                  placeholder="New password"
                  style={styles.input}
                  autoCapitalize="none"
                  value={values.newPassword}
                  onChangeText={handleChange("newPassword")}
                  onBlur={handleBlur("newPassword")}
                  secureTextEntry={showPass}
                />
                <Pressable onPress={() => setShowPass(!showPass)}>
                  <Ionicons
                    name="eye-off"
                    size={24}
                    style={{ padding: 0, margin: 0 }}
                  />
                </Pressable>
              </View>
              {touched.newPassword && errors.newPassword && (
                <Text style={styles.error}>{errors.newPassword}</Text>
              )}

              {/* Confirm Password */}
              <TextInput
                placeholder="Confirm new password"
                style={styles.input}
                autoCapitalize="none"
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                secureTextEntry={showPass}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              {/* <ReusableButton
                style={{ marginTop: 40 }}
                iconRight={"arrow-forward-outline"}
                onPress={() => handleSubmit()}
                
              /> */}

              <ReusableButton
                loading={loading}
                style={{ marginTop: 40 }}
                iconRight={"arrow-forward-outline"}
                onPress={handleSubmit}
                title="Reset Password"
              />
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "20@s",
    fontWeight: "700",
    marginTop: "20@vs",
    color: "#000",
  },
  email: {
    color: "#EA7052",
    fontWeight: "600",
    fontSize: "13@s",
    marginBottom: "20@vs",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: "8@s",
    padding: "12@s",
    marginBottom: "8@vs",
    fontSize: "14@s",
    color: "#000",
    width: '90%'
  },
  error: {
    color: "red",
    fontSize: "12@s",
    marginBottom: "6@vs",
  },
});
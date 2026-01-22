import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { router, useNavigation, useRouter } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [securePass, setSecurePass] = useState(true)

  const handlePasswordReset = async (val: any) => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.post('/auth/request-password-reset-otp', val)
      console.log({ seeRes: res })

      if (res?.data?.success) {
        router.push({
          pathname: "/resetpasswordscreen",
          params: { email: val.email },
        })
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Login verification code sent!'
        });
        setLoading(false)
      } else {

        console.log({ seeAfter: res })
        setLoading(false)
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: res?.data?.message || 'Something went wrong!',
        });

      }

    } catch (error: any) {
      console.log({ seeErrorBreak: error })
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Invalid credentials',
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
        <SafeAreaView style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }} />
        <ReusableButton
          style={{ width: 100 }}
          onPress={() => router.navigate("./authscreen")}
          iconLeft={"chevron-back"}
          extStyle={{ width: "50%", padding: 0, color: "#000" }}
          type="pressableText"
          title="Go Back"
        />
      </ImageBackground>

      {/* Form Section */}
      <View style={{ width: "100%", padding: 20 }}>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subText}>
          Enter your email address to receive a verification code.
        </Text>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={(values) => handlePasswordReset(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <TextInput
                placeholder="Enter your email"
                style={styles.input}
                value={values.email}
                autoCapitalize="none"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <ReusableButton
                loading={loading}
                style={{ marginTop: 40 }}
                iconRight={"arrow-forward-outline"}
                onPress={handleSubmit}
                title="Send Code"
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
    fontSize: "22@s",
    fontWeight: "700",
    marginTop: "20@vs",
    color: "#000",
  },
  subText: {
    fontSize: "14@s",
    color: "#555",
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
  },
  error: {
    color: "red",
    fontSize: "12@s",
    marginBottom: "6@vs",
  },
});
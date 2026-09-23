import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import { requestPasswordResetOtp } from "@/services/auth/auth";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (val: any) => {
    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(val);

      if (res?.success) {
        router.push({
          pathname: "/resetpasswordscreen",
          params: { email: val.email },
        });
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Login verification code sent!'
        });
        setLoading(false);
      } else {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: res?.message || 'Something went wrong!',
        });
      }

    } catch (error: any) {
      console.log({ seeErrorBreak: error });
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Invalid credentials',
      });
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundAccentTop} />
        <View style={styles.backgroundAccentBottom} />

        <SafeAreaView style={styles.safeArea}>
          <ReusableButton
            style={{ width: 100 }}
            onPress={() => router.navigate("./authscreen")}
            iconLeft={"chevron-back"}
            extStyle={{ width: "50%", padding: 0, color: "#000" }}
            type="pressableText"
            title="Go Back"
          />
        </SafeAreaView>

        <View style={styles.headerCard}>
          {/* <Text style={styles.badge}>Secure Access</Text> */}
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subText}>
            Enter your email address to receive a verification code.
          </Text>
        </View>

        <View style={styles.formCard}>
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
                  style={{ marginTop: 34 }}
                  iconRight={"arrow-forward-outline"}
                  onPress={handleSubmit}
                  title="Send Code"
                />
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  safeArea: {
    width: "100%",
    paddingHorizontal: "20@s",
    paddingTop: "6@vs",
  },
  backgroundAccentTop: {
    position: "absolute",
    top: "-80@vs",
    right: "-40@s",
    width: "220@s",
    height: "220@s",
    borderRadius: "110@s",
    backgroundColor: "#eae8e8",
  },
  backgroundAccentBottom: {
    position: "absolute",
    bottom: "-120@vs",
    left: "-70@s",
    width: "260@s",
    height: "260@s",
    borderRadius: "130@s",
    backgroundColor: "#f3f0ef",
  },
  headerCard: {
    marginHorizontal: "20@s",
    marginTop: "10@vs",
    padding: "18@s",
    borderRadius: "18@s",
   backgroundColor: "#f2f1f0",
    borderWidth: 1,
    borderColor: "#dfdcda",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    fontSize: "11@s",
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: "10@s",
    paddingVertical: "6@vs",
    borderRadius: "20@s",
    marginBottom: "10@vs",
  },
  formCard: {
    width: "100%",
    padding: "20@s",
    marginTop: "14@vs",
    borderTopLeftRadius: "28@s",
    borderTopRightRadius: "28@s",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: "24@s",
    fontFamily: "secondaryFont",
    color: "#111827",
  },
  subText: {
    fontSize: "13@s",
    color: "#4B5563",
    marginTop: "8@vs",
    fontFamily: "secondaryFont",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: "12@s",
    padding: "13@s",
    marginTop: "16@vs",
    marginBottom: "10@vs",
    fontSize: "14@s",
    color: "#000",
    backgroundColor: "#FCFCFD",
  },
  error: {
    color: "red",
    fontSize: "12@s",
    marginBottom: "6@vs",
  },
});
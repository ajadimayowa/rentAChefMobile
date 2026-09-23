import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import TitleText from "@/components/typography/TitleText";
import SectionText from "@/components/typography/SectionText";
import FormInput from "@/components/FormInput";
import { login as loginRequest } from "@/services/auth/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import useLocation from "@/hooks/useLocation";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [securePass, setSecurePass] = useState(true);
  const { requestLocation } = useLocation();

  useEffect(() => {
    // request location permission when login screen mounts
    requestLocation().catch(() => {});
  }, [requestLocation]);

  const handleLogin = async (val: any) => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true);
    try {
      const res = await loginRequest(val);
      if (res?.success) {
        router.push({
          pathname: "/otpverificationscreen",
          params: { email: val.email },
        });
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: "Login verification code sent!",
        });
        setLoading(false);
      } else {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: res?.message || "Something went wrong!",
        });
      }
    } catch (error: any) {
      console.log({ seeErrorBreak: error });
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error?.message || "Invalid credentials",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
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
            {/* <Text style={styles.badge}>Member Access</Text> */}
            <SectionText text="Welcome Back!" />
            <TitleText text="Login to your account" />
            <Text style={styles.headerDescription}>
              Continue where you left off and discover chef-curated meals near you.
            </Text>
          </View>

          <View style={styles.formCard}>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <FormInput label="Email" placeholder="Enter email..." id="email" />

                  <View
                    style={styles.passwordLabelRow}
                  >
                    <Text style={styles.passwordLabel}>Password</Text>

                    <TouchableOpacity onPress={() => setSecurePass(!securePass)}>
                      <Ionicons size={18} name={securePass ? "eye-off" : "eye"} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Password"
                    autoCapitalize="none"
                    style={styles.input}
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    secureTextEntry={securePass}
                  />

                  {touched.password && errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}

                  <TouchableOpacity onPress={() => router.push("/forgotpasswordscreen")}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <ReusableButton
                    loading={loading}
                    style={{ marginTop: 34 }}
                    iconRight={"arrow-forward-outline"}
                    onPress={handleSubmit}
                    title="Login"
                  />

                  <Text style={styles.signupText}>
                    Don’t have an account?{" "}
                    <Text style={styles.signupLink} onPress={() => router.push("/register")}>
                      Create one
                    </Text>
                  </Text>
                </>
              )}
            </Formik>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    position: "relative",
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
  headerDescription: {
    marginTop: "8@vs",
    color: "#4B5563",
    fontSize: "13@s",
    lineHeight: "20@s",
    fontFamily: "secondaryFont",
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
    borderColor: "#E5E7EB",
    borderRadius: "12@s",
    padding: "13@s",
    marginBottom: "10@vs",
    fontSize: "14@s",
    color: "#000",
    backgroundColor: "#FCFCFD",
  },
  passwordLabelRow: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: "20@vs",
    paddingHorizontal: "6@s",
    paddingVertical: "6@vs",
    alignItems: "center",
  },
  passwordLabel: {
    fontFamily: "secondaryFont",
    color: "#111827",
    fontSize: "13@s",
  },
  error: {
    color: "red",
    fontSize: "12@s",
    marginBottom: "6@vs",
  },
  forgotPassword: {
    color: "#0e0e0e",
    fontWeight: "600",
    fontSize: "13@s",
    alignSelf: "flex-end",
    marginTop: "5@vs",
  },
  signupText: {
    textAlign: "center",
    fontSize: "13@s",
    marginTop: "24@vs",
    color: "#4B5563",
  },
  signupLink: {
    color: "#050505",
    fontWeight: "600",
  },
});
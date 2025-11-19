import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import TitleText from "@/components/typography/TitleText";
import SectionText from "@/components/typography/SectionText";
import FormInput from "@/components/FormInput";
import api from "@/services/apiConfig";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false)

  const handleLogin = async (val: any) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/login', val)

            if(res?.data?.success){
              router.push({
                pathname: "/otpverificationscreen",
                params: { email: val.email },
            });
            setLoading(false)
            } else{
              setLoading(false)
              Alert.alert('Login Error')
            }
            
        } catch (error) {
            console.log({ seeError: error })
            setLoading(false)
        }
    }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../assets/images/header-fruits.png")}
        resizeMode="cover"
        style={{ padding: 20, height: 200, justifyContent: "flex-start" }}
      >
        <ReusableButton
          style={{ width: 100 }}
          onPress={() => router.back()}
          iconLeft={"chevron-back"}
          extStyle={{ width: "50%", padding: 0, color: "#000" }}
          type="pressableText"
          title="Go Back"
        />
      </ImageBackground>

      {/* Form Section */}
      <View style={{ width: "100%", padding: 20 }}>
        <SectionText text="Welcome Back!"/>
        <TitleText text="Login to your account"/>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => {
            handleLogin(values);
            // Example navigation after login success:
            // router.push("/home");
          }}
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
              {/* Email */}
              <FormInput label="Email" placeholder="Enter email..." id="email"/>
              

              <Text style={{fontFamily:'secondaryFont'}}>Password</Text>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry
              />
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              <TouchableOpacity
                onPress={() => router.push("/forgotpasswordscreen")}
              >
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <ReusableButton
              loading={loading}
                style={{ marginTop: 40 }}
                iconRight={"arrow-forward-outline"}
                onPress={() => handleSubmit()}
                title="Login"
              />

              <Text style={styles.signupText}>
                Don’t have an account?{" "}
                <Text
                  style={styles.signupLink}
                  onPress={() => router.push("/register")}
                >
                  Create one
                </Text>
              </Text>
            </>
          )}
        </Formik>
      </View>
    </View>
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
  forgotPassword: {
    color: "#EA7052",
    fontWeight: "600",
    fontSize: "13@s",
    alignSelf: "flex-end",
    marginTop: "5@vs",
  },
  signupText: {
    textAlign: "center",
    fontSize: "13@s",
    marginTop: "20@vs",
  },
  signupLink: {
    color: "#EA7052",
    fontWeight: "600",
  },
});
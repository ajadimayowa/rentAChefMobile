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
import { router, useRouter } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import TitleText from "@/components/typography/TitleText";
import SectionText from "@/components/typography/SectionText";
import FormInput from "@/components/FormInput";
import api from "@/services/apiConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import BodyText from "@/components/typography/BodyText";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [securePass,setSecurePass] = useState(true)

  const handleLogin = async (val: any) => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.post('/auth/login', val)
            console.log({seeRes:res})

            if(res?.data?.success){
              router.push({
                pathname: "/otpverificationscreen",
                params: { email: val.email },
            });
             Toast.show({
                                type: 'success',
                                text1: 'OTP Sent',
                                text2: 'Login verification code sent!'
                            });
            setLoading(false)
            } else{

              console.log({seeAfter:res})
              setLoading(false)
              Toast.show({
                                type: 'success',
                                text1: 'OTP Sent',
                                text2: res?.data?.message || 'Something went wrong!',
                            });
              
            }
            
        } catch (error:any) {
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
<>
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require("../assets/images/banana-top.jpg")}
        resizeMode="cover"
        style={{ padding: 20, height: 200, justifyContent: "flex-start" }}
      >
        <SafeAreaView style={{width:'100%', flexDirection:'row', justifyContent:'space-between'}}>
        <ReusableButton
          style={{ width: 100 }}
          onPress={() => router.navigate('./authscreen')}
          iconLeft={"chevron-back"}
          extStyle={{ width: "50%", padding: 0, color: "#000" }}
          type="pressableText"
          title="Go Back"
        />
        <TouchableOpacity onPress={() => router.push("/login-chef")}>
          <BodyText text=" Chef Login >"/>
        </TouchableOpacity>
        </SafeAreaView>
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
              

<View style={{width:'100%', justifyContent:'space-between',flexDirection:'row',marginTop:20,padding:10,alignItems:'center'}}>
<Text style={{fontFamily:'secondaryFont'}}>Password</Text>
              <TouchableOpacity onPress={()=>setSecurePass(!securePass)}>
                        <Ionicons size={18} name="eye-off"/>
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
    </>
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
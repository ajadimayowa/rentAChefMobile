import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import ReusableButton from "@/components/buttons/ReusableButton";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import api, { setToken } from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/store/slices/authSlice";
import BodyText from "@/components/typography/BodyText";
import { SafeAreaView } from "react-native-safe-area-context";
import SecureStorage from "@/store/secureStore";

const VerificationSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, "Enter full 6-digit code")
    .required("Verification code is required"),
});

export default function VerificationCodeScreen() {
  const navigation = useNavigation();
  const router = useRouter()
  const inputs = useRef<TextInput[]>([]);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading,setLoading] = useState(false);
  const dispatch = useDispatch()

  const handleChange = (text: string, index: number, values: any, setFieldValue: any) => {
    let newCode = values.code.split("");
    newCode[index] = text.slice(-1); // Only take last digit
    setFieldValue("code", newCode.join(""));

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number, values: any, setFieldValue: any) => {
    if (e.nativeEvent.key === "Backspace" && !values.code[index] && index > 0) {
      let newCode = values.code.split("");
      newCode[index - 1] = "";
      setFieldValue("code", newCode.join(""));
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyLoginOtp = async (val: any) => {
    let payload = {otp:val?.code,email:email}
    // console.log({pay:payload})
        setLoading(true)
        try {
            const res = await api.post('/auth/verify-loginOtp', payload)
            if(res?.data?.success){
              console.log({seeDataProfile:res?.data})
              // setToken(res?.data?.token)
              dispatch(setUserProfile(res?.data?.payload));
              await SecureStorage.setItem('userToken',res?.data?.token)


             
            Toast.show({
                            type: 'success',
                            text1: 'Success',
                            text2: 'Login Successful!'
                        });
                
            setLoading(false)
 router.replace("/(dashboard)");
           
            } else {
               setLoading(false)
            Toast.show({
                            type: 'error',
                            text1: 'Invalid OTP!'
                        });
            }
        } catch (error) {
            console.log({ seeError: error })
            setLoading(false)
            Toast.show({
                            type: 'error',
                            text1: 'Invalid OTP!'
                        });
            setLoading(false)
        }
    }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        </SafeAreaView>
      </ImageBackground>
      <View style={{ width: '100%', padding: 20 }}>
        <Text style={styles.title}>Enter the code sent to your email/phone number.</Text>
        <Text style={styles.subText}>Code sent to: <Text style={styles.email}>{email}</Text></Text>

        <Formik
          initialValues={{ code: "" }}
          validationSchema={VerificationSchema}
          onSubmit={(values) => handleVerifyLoginOtp(values)}
        >
          {({ values, setFieldValue, handleSubmit, errors, touched }) => (
            <>
              <View style={styles.codeContainer}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref: any) => (inputs.current[index] = ref!)}
                    style={[
                      styles.codeInput,
                      values.code[index]?.trim() ? styles.filledBox : {},
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={values.code[index] || ""}
                    onChangeText={(text) =>
                      handleChange(text, index, values, setFieldValue)
                    }
                    onKeyPress={(e) =>
                      handleKeyPress(e, index, values, setFieldValue)
                    }
                  />
                ))}
              </View>

              {touched.code && errors.code && (
                <Text style={styles.error}>{errors.code}</Text>
              )}

              <ReusableButton style={{ marginTop: 40 }} iconRight={"arrow-forward-outline"} onPress={() => handleSubmit()} title="Continue" />

              <Text style={styles.resendText}>
                Didn’t get code? <Text style={styles.resendLink}>Resend</Text>
              </Text>
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
  goBack: {
    fontSize: "13@s",
    color: "#555",
    marginBottom: "10@s",
  },
  headerImage: {
    width: "100%",
    height: "100@vs",
    resizeMode: "contain",
  },
  title: {
    fontSize: "20@s",
    fontWeight: "700",
    marginTop: "15@vs",
    color: "#000",
  },
  subText: {
    fontSize: "13@s",
    marginTop: "6@vs",
    marginBottom: "20@vs",
  },
  email: {
    color: "#EA7052",
    fontWeight: "600",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "20@vs",
  },
  codeInput: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: "10@s",
    width: "45@s",
    height: "50@vs",
    textAlign: "center",
    fontSize: "18@s",
    color: "#000",
    backgroundColor: "#f9f9f9",
  },
  filledBox: {
    borderColor: "#EA7052",
  },
  error: {
    color: "red",
    fontSize: "12@s",
    textAlign: "center",
    marginBottom: "10@vs",
  },
  continueBtn: {
    backgroundColor: "#EA7052",
    paddingVertical: "14@vs",
    borderRadius: "10@s",
    alignItems: "center",
    marginTop: "5@vs",
  },
  continueText: {
    color: "#fff",
    fontSize: "15@s",
    fontWeight: "600",
  },
  resendText: {
    marginTop: "15@vs",
    textAlign: "center",
    fontSize: "13@s",
  },
  resendLink: {
    color: "#EA7052",
    fontWeight: "600",
  },
});
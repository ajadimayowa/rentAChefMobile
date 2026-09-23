import React, { useRef, useState } from "react";
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
import ReusableButton from "@/components/buttons/ReusableButton";
import { router, useLocalSearchParams } from "expo-router";
import { verifyEmailOtp } from "@/services/auth/auth";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

const VerificationSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, "Enter full 6-digit code")
    .required("Verification code is required"),
});

export default function EmailVerificationCodeScreen() {
  const [loading, setLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  const { email } = useLocalSearchParams<{ email: string }>();

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
    setLoading(true);
    try {
      const res = await verifyEmailOtp({
        email: email as string,
        otp: val,
      });
      if (res?.success) {
        Toast.show({
          type: "success",
          text1: "Email verified!",
          text2: "Go back home to login",
        });

        setLoading(false);
        router.replace("/login");
      } else {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Invalid OTP!",
        });
      }
    } catch (error) {
      console.log({ seeError: error });
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Invalid OTP!",
      });
      setLoading(false);
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
            onPress={() => router.back()}
            iconLeft={"arrow-back-outline"}
            extStyle={{ width: "50%", padding: 0, color: "#000" }}
            type="pressableText"
            title="Go Back"
          />
        </SafeAreaView>

        <View style={styles.headerCard}>
          <Text style={styles.badge}>Verification</Text>
          <Text style={styles.title}>Enter your 6-digit code</Text>
          <Text style={styles.subText}>Code sent to: <Text style={styles.email}>{email}</Text></Text>
        </View>

        <View style={styles.formCard}>

          <Formik
            initialValues={{ code: "" }}
            validationSchema={VerificationSchema}
            onSubmit={(values) => handleVerifyLoginOtp(values?.code)}
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

                <ReusableButton
                  loading={loading}
                  style={{ marginTop: 34 }}
                  iconRight={"arrow-forward-outline"}
                  onPress={() => handleSubmit()}
                  title="Continue"
                />

                <Text style={styles.resendText}>
                  Didn’t get code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
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
    position: "relative",
  },
  safeArea: {
    width: "100%",
    paddingHorizontal: "20@s",
    paddingTop: "6@vs",
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
  subtitle: {
    marginTop: "8@vs",
    color: "#4B5563",
    fontSize: "13@s",
    lineHeight: "20@s",
    fontFamily: "secondaryFont",
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
    margin: "20@vs",
    gap:4
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
    borderColor: "#0e0e0e",
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
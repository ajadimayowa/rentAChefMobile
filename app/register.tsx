import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import FormInput from "@/components/FormInput";
import { registerCustomer } from "@/services/auth/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // STEP 1 OR STEP 2

    const register = async (val: any) => {
        setLoading(true)
        try {
            const res = await registerCustomer(val);
            if (res?.payload) {
                setLoading(false);
                setStep(1)
                Toast.show({
                    type: 'success',
                    text1: 'OTP Sent',
                    text2: 'Email verification code sent!'
                });
                router.replace({
                    pathname: "/emailotpverificationscreen",
                    params: { email: val.email },
                });

            } else {
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'User already exist',
                });
            }

        } catch (error) {
            setLoading(false);
            Toast.show({
                type: 'error',
                text1: 'Registration failed',
                text2: 'Email/Phone already exist!'
            });
        }
    }

    const registerSchema = Yup.object().shape({
        fullName: Yup.string()
            .trim()
            .min(3, "Full name must be at least 3 characters")
            .required("Full name is required"),

        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),

        phoneNumber: Yup.string()
            .matches(/^\d+$/, "Phone number must contain only digits")
            .min(8, "Phone number must be at least 8 digits")
            .required("Phone number is required"),

        password: Yup.string()
            .required("Password is required")
            .matches(/[A-Z]/, "Must contain at least one uppercase letter")
            .matches(/\d/, "Must contain at least one number")
            .matches(/[^A-Za-z0-9]/, "Must contain at least one special character")
            .min(7, "Password must be more than 6 characters"),
    });

    const checkPasswordRules = (pwd: string) => {
        return {
            hasCapital: /[A-Z]/.test(pwd),
            hasNumber: /\d/.test(pwd),
            hasSpecial: /[^A-Za-z0-9]/.test(pwd),
            isLong: pwd.length > 6,
        };
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
                    onPress={() => router.navigate('./authscreen')}
                    iconLeft={"chevron-back"}
                    extStyle={{ width: "50%", padding: 0, color: "#000" }}
                    type="pressableText"
                    title="Go Back"
                />
            </SafeAreaView>

            <View style={styles.headerCard}>
                {/* <Text style={styles.badge}>Create Profile</Text> */}
                <Text style={styles.title}>Create your account</Text>
                <Text style={styles.subtitle}>
                    Join to explore chef-made dishes and personalized meal experiences.
                </Text>
            </View>

            <View style={styles.formCard}>
                <Formik
                    initialValues={{
                        fullName: "",
                        email: "",
                        phoneNumber: "",
                        password: "",
                    }}
                    validationSchema={registerSchema}
                    enableReinitialize
                    onSubmit={(values) => register(values)}
                >
                    {({ handleSubmit, values, errors, touched, setFieldTouched, validateForm }) => {
                        const pwdRules = checkPasswordRules(values.password);

                        return (
                            <>
                                {step === 1 && (
                                    <>
                                        <FormInput
                                            id="fullName"
                                            label="Full Name"
                                            placeholder="Full name"
                                        />

                                        <FormInput
                                            id="email"
                                            label="Email"
                                            placeholder="Enter email..."
                                        />

                                        <FormInput
                                            id="phoneNumber"
                                            label="Phone Number"
                                            type="number"
                                            placeholder="Phone number"
                                        />

                                        <ReusableButton
                                            style={{ marginTop: 20 }}
                                            iconRight={"arrow-forward-outline"}
                                            onPress={async () => {
                                                const formErrors = await validateForm();

                                                setFieldTouched("fullName", true);
                                                setFieldTouched("email", true);
                                                setFieldTouched("phoneNumber", true);

                                                if (!formErrors.fullName && !formErrors.email && !formErrors.phoneNumber) {
                                                    setStep(2);
                                                }
                                            }}
                                            title="Continue"
                                        />

                                        <Text style={styles.signupText}>
                                            By signing up, You agree to our{" "}
                                            <Text style={styles.signupLink}>Terms</Text> &{" "}
                                            <Text style={styles.signupLink}>Policy</Text>
                                        </Text>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <FormInput
                                            id="password"
                                            label="Password"
                                            type="password"
                                            placeholder="Enter password..."
                                        />

                                        {/* PASSWORD RULES */}
                                        <View style={{ marginTop: 15 }}>
                                            {[
                                                { label: "One capital letter (A-Z)", pass: pwdRules.hasCapital },
                                                { label: "One special character (!@#$)", pass: pwdRules.hasSpecial },
                                                { label: "One number (0–9)", pass: pwdRules.hasNumber },
                                                { label: "More than 6 characters", pass: pwdRules.isLong },
                                            ].map((item, index) => (
                                                <Text
                                                    key={index}
                                                    style={[styles.ruleText, { color: item.pass ? "#16A34A" : "#DC2626" }]}
                                                >
                                                    • {item.label}
                                                </Text>
                                            ))}
                                        </View>

                                        <ReusableButton
                                            loading={loading}
                                            style={{ marginTop: 20 }}
                                            title="Register"
                                            onPress={() => handleSubmit()}
                                        />

                                        <View style={styles.previousWrap}>
                                            <ReusableButton
                                                style={{ width: 100 }}
                                                onPress={() => setStep(1)}
                                                iconLeft={"chevron-back"}
                                                extStyle={{ width: "100%", padding: 0, color: "#000" }}
                                                type="pressableText"
                                                title="Previous"
                                            />
                                        </View>
                                    </>
                                )}
                            </>
                        );
                    }}
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
    title: {
        fontSize: "30@s",
        fontFamily: "secondaryFont",
        color: "#111827",
    },
    subtitle: {
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
    signupText: {
        textAlign: "center",
        fontSize: "13@s",
        marginTop: "20@vs",
        color: "#4B5563",
    },
    signupLink: {
        color: "#EA7052",
        fontWeight: "600",
    },
    ruleText: {
        marginBottom: "4@vs",
        fontSize: "12@s",
        fontFamily: "secondaryFont",
    },
    previousWrap: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20@vs",
    },
    errorText: {
        color: "red",
        fontSize: "12@s",
        marginTop: 4,
        marginBottom: 6,
    },
});
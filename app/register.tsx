import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import FormInput from "@/components/FormInput";
import api from "@/services/apiConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BodyText from "@/components/typography/BodyText";

const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    password: Yup.string().required("Password is required"),
});

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // STEP 1 OR STEP 2

    const register = async (val: any) => {
        console.log({ SeeSending: val })
        setLoading(true)
        try {
            const res = await api.post("/auth/register", val);
            if (res?.data?.payload) {
                setLoading(false);
                setStep(1)
                Toast.show({
                    type: 'success',
                    text1: 'OTP Sent',
                    text2: 'Emain verification code sent!'
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

    const RegisterSchema = Yup.object().shape({
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
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/images/banana-top.jpg")}
                resizeMode="cover"
                style={{ padding: 20, height: 200, justifyContent: "flex-start" }}
            >
                <SafeAreaView style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ReusableButton
                        style={{ width: 100 }}
                        onPress={() => router.navigate('./authscreen')}
                        iconLeft={"chevron-back"}
                        extStyle={{ width: "50%", padding: 0, color: "#000" }}
                        type="pressableText"
                        title="Go Back"
                    />
                    <TouchableOpacity onPress={() => router.push("/signup-chef")}>
                        <BodyText text=" Chef Signup >" />
                    </TouchableOpacity>
                </SafeAreaView>
            </ImageBackground>

            <View style={{ paddingHorizontal: 30 }}>
                <Text style={styles.title}>Create your account!</Text>
            </View>

            <View style={{ width: "100%", padding: 20 }}>
                <Formik
                    initialValues={{
                        fullName: "",
                        email: "",
                        phoneNumber: "",
                        password: "",
                    }}
                    validationSchema={RegisterSchema}
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
                                                { label: "One capital letter (A–Z)", pass: pwdRules.hasCapital },
                                                { label: "One special character (!@#$)", pass: pwdRules.hasSpecial },
                                                { label: "One number (0–9)", pass: pwdRules.hasNumber },
                                                { label: "More than 6 characters", pass: pwdRules.isLong },
                                            ].map((item, index) => (
                                                <Text
                                                    key={index}
                                                    style={{
                                                        color: item.pass ? "green" : "red",
                                                        marginBottom: 4,
                                                    }}
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

                                        <View style={{ width: '100%', justifyContent: 'center',alignItems:'center', marginTop:20 }}>
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
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: "34@s",
        fontFamily: "secondaryFont",
    },
    signupText: {
        textAlign: "center",
        fontSize: "13@s",
        marginTop: "20@vs",
    },
    signupLink: {
        color: "#EA7052",
    },
    errorText: {
        color: "red",
        fontSize: "12@s",
        marginTop: 4,
        marginBottom: 6,
    },
});
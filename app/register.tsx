import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import ReusableButton from "@/components/buttons/ReusableButton";
import FormInput from "@/components/FormInput";
import api from "@/services/apiConfig";

const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
});

export default function RegisterScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)

    const register = async (val: any) => {
        console.log({sending:val})
        setLoading(true)
        try {
            const res = await api.post('/auth/register', val)

            router.push({
                pathname: "/emailotpverificationscreen",
                params: { email: val.email },
            });
            setLoading(false)
        } catch (error) {
            console.log({ seeError: error })
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/images/header-fruits.png')}
                resizeMode="cover"
                style={{ padding: 20, height: 200, justifyContent: 'flex-start' }}
            >
                <ReusableButton style={{ width: 100 }} onPress={() => router.back()} iconLeft={"chevron-back"} extStyle={{ width: '50%', padding: 0, color: '#000' }} type="pressableText" title="Go Back" />
            </ImageBackground>

            <View style={{ paddingHorizontal: 30 }}>
                <Text style={styles.title}>Create your account!</Text>
            </View>
            <View style={{ width: '100%', padding: 20 }}>


                <Formik
                    initialValues={{ fullName: "", email: "", phoneNumber: "" }}
                    validationSchema={RegisterSchema}
                    onSubmit={(values) => {
                        register(values);
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            <FormInput
                                id="fullName"
                                label="Full Name"
                                type="text"
                                placeholder="Full name"
                            />

                            <FormInput
                                id="email"
                                label="Email"
                                type="text"
                                placeholder="Enter email..."
                            />

                            <FormInput
                                id="phoneNumber"
                                label="Phone Number"
                                type="number"
                                placeholder="Phone number"
                            />

                            <Text style={styles.signupText}>
                                By signing up, You are agreeing to our{" "}
                                <Text
                                    style={styles.signupLink}
                                //   onPress={() => router.push("/register")}
                                >
                                    Terms{" "}
                                </Text>
                                <Text
                                >
                                    &{" "}
                                </Text>
                                <Text
                                    style={styles.signupLink}
                                //   onPress={() => router.push("/register")}
                                >
                                    Privacy Policy
                                </Text>
                            </Text>

                            <ReusableButton loading={loading} style={{ marginTop: 10 }} iconRight={"arrow-forward-outline"} onPress={() => handleSubmit()} title="Continue" />

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
        fontSize: "34@s",
        fontFamily: 'secondaryFont',
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: "8@s",
        padding: "12@s",
        marginBottom: "8@vs",
    },
    error: {
        color: "red",
        fontSize: "12@s",
        marginBottom: "6@vs",
    },
    continueBtn: {
        backgroundColor: "#EA7052",
        paddingVertical: "14@vs",
        borderRadius: "10@s",
        alignItems: "center",
        marginTop: "15@vs",
    },
    continueText: {
        color: "#fff",
        fontSize: "15@s",
        fontWeight: "600",
    },
    signupText: {
        textAlign: "center",
        fontSize: "13@s",
        marginTop: "20@vs",
    },
    signupLink: {
        color: "#EA7052",
    },
});
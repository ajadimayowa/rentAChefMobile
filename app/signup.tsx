import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormikContext, Formik, Field } from "formik";
import * as Yup from "yup";
import { ScaledSheet } from "react-native-size-matters";
import Animated, { SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from "react-native-reanimated";

// import reusable input
import FormInput from "../components/FormInput";

// screen width for sliding effect
const { width } = Dimensions.get("window");

// ✅ Validation Schema
const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .min(10, "Must be at least 10 digits")
    .required("Phone number is required"),
  fullName: Yup.string().required("Full name is required"),
  password: Yup.string().min(6, "Too short!").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SignupScreen() {
  const [step, setStep] = useState(1);

  const handleSubmit = (values: any) => {
    console.log("Final Signup Data:", values);
    // 🔥 call signup API here
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Formik
        initialValues={{
          email: "",
          phoneNumber: "",
          fullName: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <View style={styles.formWrapper}>
            {/* Step 1 */}
            {step === 1 && (
              <Animated.View
                entering={SlideInLeft}
                exiting={SlideOutLeft}
                style={{ width }}
              >
                <FormInput id="email" placeholder="Email" type="text" />
                <FormInput id="phoneNumber" placeholder="Phone Number" type="number" />
                <FormInput id="fullName" placeholder="Full Name" type="text" />

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <Animated.View
                entering={SlideInRight}
                exiting={SlideOutRight}
                style={{ width }}
              >
                <FormInput id="password" placeholder="Password" type="password" />
                <FormInput id="confirmPassword" placeholder="Confirm Password" type="password" />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.nextButton, styles.backButton]}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.nextButton} onPress={() => handleSubmit}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    padding: "20@ms",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "22@ms",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20@ms",
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  nextButton: {
    backgroundColor: "#1B3C53",
    paddingVertical: "12@ms",
    borderRadius: "8@ms",
    alignItems: "center",
    marginTop: "20@ms",
  },
  backButton: {
    backgroundColor: "#aaa",
    marginRight: "10@ms",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});
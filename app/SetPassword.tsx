import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import ReusableButton from "@/components/buttons/ReusableButton";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "At least 6 characters")
    .matches(/[A-Z]/, "Must contain one uppercase letter")
    .matches(/[!@#$%^&*]/, "Must contain at least one special character")
    .required("Password required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export default function SetPasswordScreen() {
  const navigation = useNavigation();
  const [showPass,setShowPass] = useState(false)

  return (
    <View style={styles.container}>
      <ImageBackground
                source={require('../assets/images/header-fruits.png')}
                resizeMode="cover"
                style={{ padding: 20, height: 200, justifyContent: 'flex-start' }}
            >
                <ReusableButton style={{ width: 100 }} onPress={() => router.back()} iconLeft={"arrow-back-outline"} extStyle={{ width: '50%', padding: 0, color: '#000' }} type="pressableText" title="Go Back" />
            </ImageBackground>
<View style={{ width: '100%', padding: 20 }}>
      <Text style={styles.title}>Set your Password</Text>

      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={PasswordSchema}
        onSubmit={(values) => {
          console.log(values);
          router.push("/login");
        }}
      >
        {({ handleChange, handleSubmit, handleBlur, values, errors, touched }) => (
          <>
          <View style={{width:'100%',flexDirection:'row', alignItems:'center', gap:10}}>
<TextInput
              placeholder="Enter password"
              style={styles.input}
              secureTextEntry={showPass}
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
            />
             <Pressable onPress={()=>setShowPass(!showPass)}>
                <Ionicons
              name="eye-off"
              size={24}
              style={{padding:0, margin:0}}
            />
             </Pressable>
          </View>
            
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            <TextInput
              placeholder="Repeat password"
              style={styles.input}
              secureTextEntry={showPass}
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

           <ReusableButton style={{ marginTop: 40 }} onPress={() => handleSubmit()} title="Complete"/>
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
    fontSize: "22@s",
    fontWeight: "700",
    marginVertical: "20@vs",
  },
  input: {
    width:'90%',
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
  completeBtn: {
    backgroundColor: "#EA7052",
    paddingVertical: "14@vs",
    borderRadius: "10@s",
    alignItems: "center",
    marginTop: "15@vs",
  },
  completeText: {
    color: "#fff",
    fontSize: "15@s",
    fontWeight: "600",
  },
});
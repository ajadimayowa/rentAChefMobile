// components/FormInput.tsx
import React from "react";
import { TextInput, Text, View, TouchableOpacity } from "react-native";
import { useFormikContext, Formik, Field,useField } from "formik";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";

type InputProps = {
  label?:string;
  id: string;                  // field name in Formik
  placeholder?: string;
  type?: "text" | "number" | "password";
};

export default function ReusableInput({ id, placeholder,label, type = "text" }: InputProps) {
  const [field, meta, helpers] = useField(id);

  const secure = type === "password";
  const keyboardType = type === "number" ? "numeric" : "default";

  return (
    <View style={styles.container}>
        {label&&<Text style={{fontFamily:'secondaryFont'}}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          meta.touched && meta.error ? styles.inputError : null,
        ]}
        placeholder={placeholder}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        value={field.value}
        onChangeText={helpers.setValue}
        onBlur={() => helpers.setTouched(true)}
      />
      {meta.touched && meta.error ? (
        <Text style={styles.errorText}>{meta.error}</Text>
      ) : null}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    marginVertical: "8@vs",
    
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: "8@ms",
    padding: "12@ms",
    fontSize: "14@ms",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: "12@ms",
    marginTop: "4@vs",
  },
});
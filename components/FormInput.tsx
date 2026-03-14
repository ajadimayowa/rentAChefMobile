// components/FormInput.tsx

import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useField } from "formik";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type Option = {
  label: string;
  value: string;
};

type InputProps = {
  label?: string;
  id: string;
  placeholder?: string;
  type?: "text" | "number" | "password" | "select" | "date" | "textarea"
  options?: Option[]; // For dropdown
};

export default function FormInput({
  id,
  placeholder,
  label,
  type = "text",
  options = [],
}: InputProps) {
  const [field, meta, helpers] = useField(id);
  const [showDate, setShowDate] = useState(false);

  const secure = type === "password";
  const keyboardType = type === "number" ? "numeric" : "default";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* TEXT / NUMBER / PASSWORD */}
      {(type === "text" || type === "number" || type === "password") && (
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
      )}

      {(type === "textarea") && (
        <TextInput
        multiline
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
      )}

      {/* SELECT DROPDOWN */}
      {type === "select" && (
        <View
          style={[
            styles.pickerWrapper,
            meta.touched && meta.error ? styles.inputError : null,
          ]}
        >
          <Picker
            selectedValue={field.value}
            onValueChange={(value) => helpers.setValue(value)}
          >
            <Picker.Item label={placeholder || "Select option"} value="" />
            {options.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* DATE PICKER */}
      {type === "date" && (
        <>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              meta.touched && meta.error ? styles.inputError : null,
            ]}
            onPress={() => setShowDate(true)}
          >
            <Text style={{ color: field.value ? "#000" : "#999" }}>
              {field.value
                ? new Date(field.value).toDateString()
                : placeholder || "Select date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} />
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={field.value ? new Date(field.value) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDate(false);
                if (selectedDate) {
                  helpers.setValue(selectedDate.toISOString());
                }
              }}
            />
          )}
        </>
      )}

      {meta.touched && meta.error && (
        <Text style={styles.errorText}>{meta.error}</Text>
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    marginVertical: "8@vs",
  },
  label: {
    marginBottom: "4@vs",
    fontFamily: "secondaryFont",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: "8@ms",
    padding: "12@ms",
    fontSize: "14@ms",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: "8@ms",
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
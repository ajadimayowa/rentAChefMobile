import React from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
} from "react-native";

export type MultiStepInputType = "text" | "number" | "multiline";

interface MultiStepInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;

  inputType?: MultiStepInputType;

  touched?: boolean;
  error?: string;

  required?: boolean;
}

const MultiStepInput: React.FC<MultiStepInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  inputType = "text",
  touched,
  error,
  required,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        autoCorrect={false}
        autoComplete="off"
        autoCapitalize="none"
        style={[
          styles.input,
          inputType === "multiline" && styles.multiline,
          touched && error && styles.inputError,
          style,
        ]}
        keyboardType={
          inputType === "number" ? "numeric" : "default"
        }
        multiline={inputType === "multiline"}
        textAlignVertical={
          inputType === "multiline" ? "top" : "center"
        }
        {...props}
      />

      {touched && !!error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

export default MultiStepInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  required: {
    color: "red",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  multiline: {
    height: 65,
    paddingTop: 12,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  error: {
    marginTop: 6,
    color: "#EF4444",
    fontSize: 13,
  },
});
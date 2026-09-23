import React from "react";
import { View } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";

interface Props {
  step: any;
  formValues: Record<string, any>;
  onChangeValue: (field: string, value: any) => void;
  acceptedTerms: boolean;
  onToggleTerms: () => void;
  onProceedPayment: () => void;
}

const fieldInputByType = (type?: string) => {
  switch (type) {
    case "number":
      return "numeric";
    default:
      return "default";
  }
};

const WorkflowStepRenderer: React.FC<Props> = ({
  step,
  formValues,
  onChangeValue,
  acceptedTerms,
  onToggleTerms,
  onProceedPayment,
}) => {
  const stepDescription = String(step?.description || step?.config?.description || "");
  const stepKey = step?.stepKey || step?.id;

  const isTermsStep = String(step?.type || "").toLowerCase() === "terms" || String(stepKey).toLowerCase() === "terms";

  if (isTermsStep) {
    return (
      <View style={styles.block}>
        {stepDescription ? <Text style={styles.stepDescription}>{stepDescription}</Text> : null}
        {(step?.data?.terms || []).length ? (
          step?.data?.terms.map((term: string, index: number) => (
            <Text key={`${index}-${term}`} style={styles.termsItem}>• {term}</Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No terms available.</Text>
        )}
        <View style={styles.acceptRow}>
          <Checkbox status={acceptedTerms ? "checked" : "unchecked"} onPress={onToggleTerms} />
          <Text>I accept the terms and conditions</Text>
        </View>
      </View>
    );
  }

  if (step?.type === "form") {
    return (
      <View style={styles.block}>
        {stepDescription ? <Text style={styles.stepDescription}>{stepDescription}</Text> : null}
        {(step?.config?.fields || []).map((field: any, index: number) => (
          <View key={`${field?.name}-${index}`} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{field?.label || field?.name}</Text>
            <TextInput
              mode="outlined"
              value={String(formValues[field?.name] ?? "")}
              onChangeText={(val) => onChangeValue(field?.name, val)}
              placeholder={field?.label || field?.name}
              keyboardType={fieldInputByType(field?.type)}
            />
          </View>
        ))}
      </View>
    );
  }

  if (step?.type === "selection") {
    return (
      <View style={styles.block}>
        {stepDescription ? <Text style={styles.stepDescription}>{stepDescription}</Text> : null}
        <Text style={styles.fieldLabel}>Selections</Text>
        <TextInput
          mode="outlined"
          placeholder={step?.config?.multiSelect ? "Comma-separated values" : "Enter selection"}
          value={String(formValues[stepKey] ?? "")}
          onChangeText={(val) => onChangeValue(stepKey, val)}
        />
      </View>
    );
  }

  if (step?.type === "payment") {
    return (
      <View style={styles.block}>
        {stepDescription ? <Text style={styles.stepDescription}>{stepDescription}</Text> : null}
        <Text style={styles.paymentTitle}>Deposit Payment</Text>
        <Text style={styles.paymentText}>Complete payment to continue.</Text>
        <Button mode="contained" onPress={onProceedPayment}>Proceed to Payment</Button>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      {stepDescription ? <Text style={styles.stepDescription}>{stepDescription}</Text> : null}
      <Text>Unsupported step type.</Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  block: { marginTop: "12@vs" },
  stepDescription: { fontSize: "13@ms", color: "#666", marginBottom: "8@vs" },
  termsItem: { fontSize: "12@ms", color: "#6B5A3C", marginBottom: "4@vs" },
  emptyText: { textAlign: "center", color: "#999" },
  acceptRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: "10@vs" },
  fieldRow: { gap: 6, marginBottom: "12@vs" },
  fieldLabel: { fontSize: "13@ms", color: "#555" },
  paymentTitle: { fontSize: "15@ms", fontWeight: "600" },
  paymentText: { color: "#666", marginBottom: "8@vs" },
});

export default WorkflowStepRenderer;

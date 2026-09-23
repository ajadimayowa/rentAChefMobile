import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { Checkbox } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { cpApi } from "@/services/cpApi";
import { getTermsAndCons, TermsAndConItem } from "@/services/termsAndConService";
import { getServiceById, ServicePayload } from "@/services/serviceService";
import PrimaryLoader from "@/components/Loader";
import ReusableButton from "@/components/buttons/ReusableButton";

interface FormValues {
  acceptedTerms: boolean;
  placeholderInput: string;
}

export default function StoragePackageScreen() {
  const profile = useSelector((state: RootState) => state.auth.bioData) as any;
  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceName?: string;
    categoryId?: string;
    workflow?: string;
  }>();

  

  const [stepIndex, setStepIndex] = useState(0);
  const [loadingService, setLoadingService] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [terms, setTerms] = useState<TermsAndConItem[]>([]);
  const [service, setService] = useState<ServicePayload | null>(null);

  const requestedServiceId = useMemo(() => {
    const raw = params.serviceId;
    if (Array.isArray(raw)) {
      return String(raw[0] || "").trim();
    }
    return String(raw || "").trim();
  }, [params.serviceId]);

  useEffect(() => {
    const fetchServiceAndTerms = async () => {
      if (!params.serviceId) {
        Toast.show({ type: "error", text1: "Missing service", text2: "Unable to continue without a serviceId." });
        setService(null);
        setTerms([]);
        return;
      }

      try {
        setLoadingService(true);
        const fetchedService = await getServiceById(params.serviceId);
        

        if (!fetchedService) {
          Toast.show({ type: "error", text1: "Service not found", text2: "The selected service could not be loaded." });
          setService(null);
          setTerms([]);
          return;
        }

        setService(fetchedService);

        setLoadingTerms(true);
        const records = await getTermsAndCons(params.serviceId);
        setTerms(records);
      } catch (error: any) {
        Toast.show({ type: "error", text1: "Failed to load terms", text2: error?.message || "Please try again." });
        setService(null);
        setTerms([]);
      } finally {
        setLoadingService(false);
        setLoadingTerms(false);
      }
    };

    fetchServiceAndTerms();
  }, [requestedServiceId]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        acceptedTerms: Yup.boolean().oneOf([true], "You must accept terms and conditions"),
        placeholderInput:
          stepIndex === 1 ? Yup.string().trim().required("This field is required") : Yup.string().trim(),
      }),
    [stepIndex]
  );

  const onComplete = async (values: FormValues) => {
    if (!profile?.id) {
      Toast.show({ type: "error", text1: "Login required" });
      return;
    }

    setSubmitting(true);
    try {
      const booking = await cpApi.createBooking({
        customerId: String(profile.id),
        serviceId: String(service?.id || requestedServiceId || ""),
        serviceCategoryId: String(service?.category?.id || params.categoryId || ""),
        workflow: params.workflow || "HOME_CHEF",
        chefLevel: "JUNIOR",
        paymentModel: "instant",
        bookingData: {
          serviceName: service?.name || params.serviceName || "Alase Service",
          serviceWorkflow: service?.workflow || "",
          acceptedTerms: values.acceptedTerms,
          acceptedTermsAt: new Date().toISOString(),
          terms: terms.map((item) => item.description),
          placeholderInput: values.placeholderInput,
        },
      });

      Toast.show({ type: "success", text1: "Booking created", text2: `Booking No: ${booking?.bookingNumber || "-"}` });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Booking failed", text2: error?.message || "Try again" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingService || loadingTerms) {
    return <PrimaryLoader />;
  }

  return (
    <Formik<FormValues>
      initialValues={{ acceptedTerms: false, placeholderInput: "" }}
      validationSchema={validationSchema}
      onSubmit={onComplete}
      validateOnMount
    >
      {({ values, errors, touched, setFieldValue, setFieldTouched, handleSubmit }) => {
        const continueFromTerms = () => {
          setFieldTouched("acceptedTerms", true, true);
          if (!values.acceptedTerms) return;
          setStepIndex(1);
        };

        return (
          <ScrollView contentContainerStyle={[styles.container, stepIndex === 0 && styles.stepOneContainer]}>
            
            <Text style={styles.subtitle}>Step {stepIndex + 1} of 2</Text>

            {stepIndex === 0 ? (
              <View style={[styles.stepCard, styles.stepOneCard]}>
                <View style={styles.termsContent}>
                  <Text style={styles.stepTitle}>Terms and Conditions</Text>
                  <Text style={styles.stepDescription}>Please review and accept the terms before continuing.</Text>

                  {loadingService ? (
                    <Text style={styles.metaText}>Loading service...</Text>
                  ) : loadingTerms ? (
                    <Text style={styles.metaText}>Loading terms...</Text>
                  ) : terms.length === 0 ? (
                    <Text style={styles.metaText}>No terms configured for this service yet.</Text>
                  ) : (
                    <ScrollView style={styles.termsScroll} contentContainerStyle={styles.termsList} showsVerticalScrollIndicator={false}>
                      {terms.map((item, index) => (
                        <View key={item.id || String(index)} style={styles.termRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.termText}>{item.description}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.stepOneFooter}>
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setFieldValue("acceptedTerms", !values.acceptedTerms)} activeOpacity={0.85}>
                    <View style={styles.checkboxBox}>
                      <Checkbox
                        status={values.acceptedTerms ? "checked" : "unchecked"}
                        onPress={() => setFieldValue("acceptedTerms", !values.acceptedTerms)}
                        color="#000000"
                        uncheckedColor="#000000"
                      />
                    </View>
                    <Text style={styles.checkboxText}>I accept the terms and conditions</Text>
                  </TouchableOpacity>

                  {touched.acceptedTerms && errors.acceptedTerms ? <Text style={styles.errorText}>{errors.acceptedTerms}</Text> : null}

                  <ReusableButton title="Continue" onPress={continueFromTerms} style={styles.continueBtn} />
                </View>
              </View>
            ) : (
              <View style={styles.stepCard}>
                <Text style={styles.stepTitle}>Step 2: Alase Service Details</Text>
                <Text style={styles.stepDescription}>Placeholder for Alase Service specific step fields.</Text>

                <TextInput
                  placeholder="Enter placeholder value"
                  value={values.placeholderInput}
                  onChangeText={(text) => setFieldValue("placeholderInput", text)}
                  style={styles.input}
                />

                {touched.placeholderInput && errors.placeholderInput ? <Text style={styles.errorText}>{errors.placeholderInput}</Text> : null}

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStepIndex(0)}>
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, submitting && styles.btnDisabled]} onPress={() => handleSubmit()} disabled={submitting}>
                    <Text style={styles.primaryBtnText}>{submitting ? "Submitting..." : "Complete Booking"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        );
      }}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#fff", flexGrow: 1 },
  stepOneContainer: { flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  subtitle: { color: "#64748b", marginBottom: 4 },
  stepCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    backgroundColor: "#ffffff",
  },
  stepOneCard: { flex: 1 },
  termsContent: { flex: 1, gap: 10 },
  termsScroll: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  stepDescription: { color: "#475569", fontSize: 13 },
  termsList: { gap: 8 },
  termRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: { fontSize: 15, color: "#f97316", marginTop: 2 },
  termText: { flex: 1, color: "#334155", fontSize: 13, lineHeight: 18 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkboxBox: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  checkboxText: { color: "#334155", fontSize: 13, flex: 1 },
  stepOneFooter: { gap: 8, paddingTop: 8 },
  errorText: { color: "#dc2626", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#000000ff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtn: {
    backgroundColor: "#000000ff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#334155", fontWeight: "700" },
  btnDisabled: { opacity: 0.7 },
  metaText: { color: "#64748b", fontSize: 13 },
});

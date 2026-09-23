import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "@/components/buttons/ReusableButton";
import PrimaryLoader from "@/components/Loader";
import { verifyEmailOtp } from "@/services/auth/auth";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailDeepLinkScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!email || !otp) {
        setStatus("error");
        setMessage("This verification link is missing information. Please use the code from your email instead.");
        return;
      }

      try {
        const res = await verifyEmailOtp({ email, otp });
        if (res?.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(res?.message || "This link is invalid or has expired.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message || "This link is invalid or has expired.");
      }
    };

    run();
  }, [email, otp]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.backgroundAccentTop} />
          <View style={styles.backgroundAccentBottom} />

          <SafeAreaView style={styles.content}>
            {status === "verifying" && (
              <>
                <PrimaryLoader />
                <Text style={styles.title}>Verifying your email…</Text>
              </>
            )}

            {status === "success" && (
              <View style={styles.resultCard}>
                <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
                <Text style={styles.title}>Email verified!</Text>
                <Text style={styles.subtitle}>
                  Your email has been confirmed. You can now log in to your account.
                </Text>
                <ReusableButton
                  style={{ marginTop: 24, width: "100%" }}
                  title="Continue to Login"
                  onPress={() => router.replace("/login")}
                />
              </View>
            )}

            {status === "error" && (
              <View style={styles.resultCard}>
                <Ionicons name="close-circle" size={64} color="#DC2626" />
                <Text style={styles.title}>Verification failed</Text>
                <Text style={styles.subtitle}>{message}</Text>
                <ReusableButton
                  style={{ marginTop: 24, width: "100%" }}
                  title="Enter code manually"
                  onPress={() =>
                    router.replace({
                      pathname: "/emailotpverificationscreen",
                      params: { email: email || "" },
                    })
                  }
                />
              </View>
            )}
          </SafeAreaView>
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
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: "24@s",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCard: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "20@s",
    padding: "28@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: "20@s",
    fontFamily: "secondaryFont",
    color: "#111827",
    marginTop: "16@vs",
    textAlign: "center",
  },
  subtitle: {
    marginTop: "8@vs",
    color: "#4B5563",
    fontSize: "13@s",
    lineHeight: "20@s",
    textAlign: "center",
  },
});

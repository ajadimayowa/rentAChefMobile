import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import BodyText from "../typography/BodyText";
import { IconButton } from "react-native-paper";
import { WebView } from "react-native-webview";
import api from "@/services/apiConfig";

interface LoadingThenSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    loading?: boolean;
    title?: string;
    description?: string;
    customerEmail?: string;
    amount?: number;
    onPaymentSuccess?: (reference: string) => void;
    onInitializationStateChange?: (state: "idle" | "initializing" | "ready" | "error") => void;
}

const PaymentModal: React.FC<LoadingThenSuccessModalProps> = ({
    visible,
    onClose,
    title,
    description,
    customerEmail,
    amount = 0,
    onPaymentSuccess,
    onInitializationStateChange,
}) => {
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [initializingPayment, setInitializingPayment] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const hasInitializedPaymentRef = useRef(false);
    const hasCompletedPaymentRef = useRef(false);

    useEffect(() => {
        if (!visible) {
            setPaymentUrl(null);
            setErrorMessage("");
            setInitializingPayment(false);
            setVerifyingPayment(false);
            hasInitializedPaymentRef.current = false;
            hasCompletedPaymentRef.current = false;
            onInitializationStateChange?.("idle");
        }
    }, [visible, onInitializationStateChange]);

    const payableAmount = useMemo(() => {
        const parsedAmount = Number(amount || 0);
        return parsedAmount > 0 ? parsedAmount : 100;
    }, [amount]);

    const parseReferenceFromUrl = (rawUrl: string) => {
        const normalizedUrl = String(rawUrl || "");
        const match = normalizedUrl.match(/[?&](reference|trxref)=([^&#]+)/i);
        const reference = match?.[2] ? decodeURIComponent(match[2]) : "";
        console.log("Payment reference FROM URL:", reference);
        return reference;
    };

    const isCancellationUrl = (rawUrl: string) => {
        const normalizedUrl = String(rawUrl || "").toLowerCase();

        return (
            /[?&]status=cancel/i.test(normalizedUrl) ||
            /[?&]status=cancelled/i.test(normalizedUrl) ||
            /[?&]cancel=true/i.test(normalizedUrl) ||
            /[?&]cancelled=true/i.test(normalizedUrl) ||
            /\/cancel/i.test(normalizedUrl)
        );
    };

    const handlePaymentCancellation = useCallback(() => {
        setErrorMessage("Payment was cancelled or failed. Please try again.");
        onClose();
    }, [onClose]);

    const verifyPaymentAndComplete = async (reference: string) => {
        if (!reference || verifyingPayment || hasCompletedPaymentRef.current) return;

        setVerifyingPayment(true);
        setErrorMessage("");

        try {
            const response = await api.post(`/payment/verify/${reference}`);
            const paymentStatus = String(response?.data?.data?.status || "").toLowerCase();

            if (paymentStatus === "success") {
                hasCompletedPaymentRef.current = true;
                onPaymentSuccess?.(reference);
                onClose();
                return;
            }

            setErrorMessage(response?.data?.message || "Payment verification failed.");
        } catch (error: any) {
            setErrorMessage(error?.message || "Payment verification failed. Please try again.");
        } finally {
            setVerifyingPayment(false);
        }
    };

    const handleStartPayment = async () => {
        if (initializingPayment) return;

        if (!customerEmail) {
            setErrorMessage("No customer email found. Please login again.");
            return;
        }

        setInitializingPayment(true);
        setErrorMessage("");
        onInitializationStateChange?.("initializing");

        try {
            const response = await api.post("/payment/initialize-payment", {
                email: customerEmail,
                amount: payableAmount,
                callback_url: 'https://rent-a-chef-portal.vercel.app/payment-succesful'
            });

            const nextUrl = response?.data?.data?.authorization_url;

            if (!nextUrl) {
                setErrorMessage("Unable to initialize payment. Please try again.");
                onInitializationStateChange?.("error");
                return;
            }

            setPaymentUrl(nextUrl);
            onInitializationStateChange?.("ready");
        } catch (error: any) {
            setErrorMessage(error?.message || "Failed to initialize payment.");
            onInitializationStateChange?.("error");
        } finally {
            setInitializingPayment(false);
        }
    };

    useEffect(() => {
        if (!visible) return;
        if (paymentUrl) return;
        if (hasInitializedPaymentRef.current) return;

        hasInitializedPaymentRef.current = true;
        handleStartPayment();
    }, [visible, paymentUrl]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <SectionText text={title || "Complete Payment"} />

                        <IconButton
                            icon="close"
                            onPress={onClose}
                        />
                    </View>

                    {!!errorMessage && (
                        <View style={styles.errorBadge}>
                            <BodyText text={errorMessage} textStyle={{ color: "#B91C1C" }} />
                        </View>
                    )}

                    <View style={{ width: "100%", marginTop: 10, flex: 1 }}>
                        {!paymentUrl ? (
                            <View style={styles.loadingWrapper}>
                                <BodyText text={description || "Loading Paystack payment screen..."} />

                                {(initializingPayment || verifyingPayment) && (
                                    <View style={{ marginTop: 8 }}>
                                        <ActivityIndicator size="small" color="#111" />
                                    </View>
                                )}

                                {!!errorMessage && !initializingPayment && (
                                    <PrimaryActionButton
                                        title="Retry"
                                        onPress={handleStartPayment}
                                        style={styles.button}
                                    />
                                )}
                            </View>
                        ) : (
                            <WebView
                                source={{ uri: paymentUrl }}
                                javaScriptEnabled
                                domStorageEnabled
                                startInLoadingState
                                originWhitelist={["*"]}
                                mixedContentMode="always"
                                onShouldStartLoadWithRequest={(request) => {
                                    const requestUrl = String(request?.url || "");
                                    console.log("Request:", request.url);

                                    if (!requestUrl) return true;

                                    if (isCancellationUrl(requestUrl) || /[?&]status=failed/i.test(requestUrl) || /cancel/i.test(requestUrl)) {
                                        handlePaymentCancellation();
                                        return false;
                                    }

                                    return true;
                                }}
                                onNavigationStateChange={(state) => {
                                    const currentUrl = String(state?.url || "");

                                    if (!currentUrl) return;

                                    if (isCancellationUrl(currentUrl)) {
                                        handlePaymentCancellation();
                                        return;
                                    }
                                    const reference = parseReferenceFromUrl(currentUrl);
                                    console.log("Payment reference FROM URL:", reference);

                                    if (reference) {
                                        verifyPaymentAndComplete(reference);
                                    }

                                    if (/[?&]status=failed/i.test(currentUrl) || /cancel/i.test(currentUrl)) {
                                        handlePaymentCancellation();
                                    }
                                }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.45)",
    },

    container: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: "20@ms",
        borderTopRightRadius: "20@ms",
        padding: "18@ms",
        alignItems: "center",
        height: "800@ms",
    },

    header: {
        // backgroundColor:'red',
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10@ms",
    },

    button: {
        marginTop: "14@ms",
        backgroundColor: "#050505ff",
        width: "100%",
        color: "#fff",
    },

    loadingWrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    errorBadge: {
        width: "100%",
        backgroundColor: "#FEE2E2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: "8@ms",
        padding: "10@ms",
        marginTop: "4@ms",
    },

});

export default PaymentModal;
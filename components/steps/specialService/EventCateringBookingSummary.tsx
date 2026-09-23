import React from "react";
import { Image } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import receiptIcon from "../../../assets/icons/receiptIcon.png";
import BodyText from "../../typography/BodyText";
import LoadingThenSuccessModal from "@/components/modals/LoadingThenSuccessModal";
import { Ionicons } from "@expo/vector-icons";
import { convertToThousand } from "@/helpers/utils";

interface EventCateringBookingSummaryProps {
    bookingSummary: any,
    submitLoading?: boolean,
    submitSuccess?: boolean,
    submitModalVisible?: boolean,
    onSubmissionModalClose?: () => void,
}


const EventCateringBookingSummary: React.FC<EventCateringBookingSummaryProps> = ({
    bookingSummary,
    submitLoading,
    submitSuccess,
    submitModalVisible,
    onSubmissionModalClose,
}) => {
    const menuTotalPrice = Number(bookingSummary?.menuTotalPrice || 0);
    const vat = Number(bookingSummary?.vat || 0);
    const serviceCharge = Number(bookingSummary?.serviceCharge || 0);
    const transportationCost = Number(bookingSummary?.transportationCost || 0);
    const totalBookingCost = Number(bookingSummary?.totalBookingCost || 0);
    const isInstantPayment = String(bookingSummary?.paymentOption || "").toLowerCase() === "instant";

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={receiptIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Booking Summary" />
                <BodyText text="Here is a summary of your booking." />

                {isInstantPayment && (
                    <View style={{ marginTop: 8, backgroundColor: "#ECFDF3", borderColor: "#ABEFC6", borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}>
                        <BodyText text="Instant Payment" textStyle={{ color: "#067647" }} />
                    </View>
                )}

                <View style={{ marginTop: 10, backgroundColor:'#FFFBED', width: "100%", padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, flexDirection:'row',gap:10 }}>
                    <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
                    <View style={{ flex: 1, backgroundColor: 'transparent', maxWidth: "90%" }}>
                        <BodyText
                            text={
                                isInstantPayment
                                    ? "Menu selections included. This booking uses instant payment and charges are shown below."
                                    : "This is a quote request. Our team will review your requirements and send a detailed price breakdown within 24 hours."
                            }
                        />
                    </View>
                </View>


            </FrameCard>
            <FrameCard>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Event date`} />
                    <BodyText text={`${bookingSummary.startDate?.toLocaleDateString() || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Arrival time`} />
                    <BodyText text={`${bookingSummary.arrivalTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Service time`} />
                    <BodyText text={`${bookingSummary.serviceTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Address`} />
                    <BodyText text={`${bookingSummary.eventAddress || "-"}`} />
                </View>
            </FrameCard>

            {isInstantPayment && (
                <FrameCard>
                    <SectionText text={`Cost Breakdown`} />
                    <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, gap: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <BodyText text={`Selected Menu Cost`} />
                            <BodyText text={`${convertToThousand(menuTotalPrice)}`} />
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <BodyText text={`VAT`} />
                            <BodyText text={`${convertToThousand(vat)}`} />
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <BodyText text={`Service Charge`} />
                            <BodyText text={`${convertToThousand(serviceCharge)}`} />
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <BodyText text={`Logistics / Transportation`} />
                            <BodyText text={`${convertToThousand(transportationCost)}`} />
                        </View>
                    </View>

                    <View style={{ marginTop: 12, padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, backgroundColor: "#F9FAFB", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <SectionText text={`Overall Booking Cost`} />
                        <SectionText text={`${convertToThousand(totalBookingCost)}`} textStyle={{ color: "#12B76A" }} />
                    </View>
                </FrameCard>
            )}

            <FrameCard>
                <SectionText text={`Extra Note`} />
                <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5 }}>
                    <BodyText text={`${bookingSummary.additionalNote || "-"}`} />
                </View>
            </FrameCard>

            <LoadingThenSuccessModal
                visible={!!submitModalVisible}
                onClose={onSubmissionModalClose || (() => {})}
                loading={!!submitLoading && !submitSuccess}
                title={isInstantPayment ? "Booking Successful!" : "Quote Request Submitted!"}
                description={isInstantPayment ? "Your catering event is locked in." : "We'll send your quote within 24 hours."}


/>
        </>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        padding: "20@ms",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: "24@ms",
        fontWeight: "bold",
        marginBottom: "20@ms",
    },
    scrollContainer: {
        flex: 1,
    },
    text: {
        fontSize: "16@ms",
        marginBottom: "10@ms",
    },
    titleCard: {
        alignItems: "center",
        justifyContent: "center",
    }
});

export default EventCateringBookingSummary;
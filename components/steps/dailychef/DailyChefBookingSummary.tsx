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
import moment from "moment";
import { convertToThousand } from "@/helpers/utils";

interface DailyChefBookingSummaryProps {
    bookingSummary: any,
    submitLoading?: boolean,
    submitSuccess?: boolean,
    submitModalVisible?: boolean,
    onSubmissionModalClose?: () => void,
}


const DailyChefBookingSummary: React.FC<DailyChefBookingSummaryProps> = ({
    bookingSummary,
    submitLoading,
    submitSuccess,
    submitModalVisible,
    onSubmissionModalClose,
}) => {
    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={receiptIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Booking Summary" />
                <BodyText text="Here is a summary of your booking." />

                {
                    bookingSummary.paymentOption === "quotation" &&
                    <View style={{ marginTop: 10, backgroundColor: '#FFFBED', width: "100%", padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, flexDirection: 'row', gap: 10 }}>
                        <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
                        <View style={{ flex: 1, backgroundColor: 'transparent', maxWidth: "90%" }}>
                            <BodyText text={`This is a quote request. Our admin team will review your requirements and follow up with a detailed price breakdown.`} />
                        </View>
                    </View>}


            </FrameCard>
            <FrameCard>
                <SectionText text="Details" textStyle={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Date of event`} />
                    <BodyText text={`${bookingSummary.startDate?.toLocaleDateString() || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Chef `} />
                    <BodyText text={`${bookingSummary.selectedChef.name || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Chef Level`} />
                    <BodyText text={`${bookingSummary.chefCategory.name || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Menu Style`} />
                    <BodyText text={`${bookingSummary.menuDeliveryOption.name || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Procurement By`} />
                    <BodyText text={`${bookingSummary.ingredientProcurementOption.value || "-"}`} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Arrival time`} />
                    <BodyText text={`${moment(bookingSummary.arrivalTime).format("h:mm a") || "-"}`} />
                </View>

            </FrameCard>

            <FrameCard>
                <SectionText text="Payment Summary" textStyle={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Chef Fee`} />
                    <BodyText text={`${convertToThousand(bookingSummary.chefCategory.basePriceMinor)}`} />
                </View>

                {
                    bookingSummary.ingredientProcurementOption.value.toLowerCase() === "organization" &&
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <BodyText text={`Cost of Ingredients`} />
                        <BodyText text={`${convertToThousand(bookingSummary.menuTotalPrice) || "-"}`} />
                    </View>
                }


                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Transportation`} />
                    <BodyText text={`${convertToThousand(bookingSummary.transportationCost) || "-"}`} />
                </View>

                {
                    bookingSummary.ingredientProcurementOption.value.toLowerCase() === "organization" &&
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Service Charge (10%)`} />
                    <BodyText text={`${convertToThousand(bookingSummary.serviceCharge) || "-"}`} />
                </View>}

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`VAT (7.5%)`} textStyle={{ fontWeight: '900' }} />
                    <BodyText text={`${convertToThousand(bookingSummary.vat) || "-"}`} />
                </View>







                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <BodyText text={`Total Cost`} />
                    <BodyText text={`${convertToThousand(bookingSummary.totalBookingCost) || "-"}`} />
                </View>

            </FrameCard>


            <LoadingThenSuccessModal
                visible={!!submitModalVisible}
                onClose={onSubmissionModalClose || (() => { })}
                loading={!!submitLoading && !submitSuccess}
                title="Booking Successful!"
                description="Your daily chef has been booked successfully."


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

export default DailyChefBookingSummary;
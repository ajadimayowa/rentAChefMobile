import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import receiptIcon from "../../../assets/icons/receiptIcon.png";
import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";
import ReusableInput from "@/components/ReusableInput";
import MultiStepInput from "@/components/inputs/MultiStepInputType";
import ListCardWithIconOnly from "@/components/cards/ListCardWithIconOnly";
import LoadingThenSuccessModal from "@/components/modals/LoadingThenSuccessModal";
import { Ionicons } from "@expo/vector-icons";

interface AlaseBookingSummaryProps {
    bookingSummary: any,
    submitLoading?: boolean,
    submitSuccess?: boolean,
    submitModalVisible?: boolean,
    onSubmissionModalClose?: () => void,
}


const AlaseBookingSummary: React.FC<AlaseBookingSummaryProps> = ({
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

                <View style={{ marginTop: 10, backgroundColor:'#FFFBED', width: "100%", padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, flexDirection:'row',gap:10 }}>
                    <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
                    <View style={{ flex: 1, backgroundColor: 'transparent', maxWidth: "90%" }}>
                        <BodyText text={`This is a quote request. Our admin team will review your requirements and follow up with a detailed price breakdown.`} />
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

            <FrameCard>
                <SectionText text="Protein Selection" />
                {bookingSummary.proteinOptions.map((item: any) => (
                    <ListCardWithIconOnly
                        key={item.value}
                        data={{
                            value: item.value,
                            label: item.label,
                            count: item.count,
                            icon: item.icon as ImageSourcePropType,
                        }}
                    />
                ))}

            </FrameCard>

            <FrameCard>
                <SectionText text={`Cooking Instructions`} />
                <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5 }}>
                    <BodyText text={`${bookingSummary.cookingInstructions || "-"}`} />
                </View>
            </FrameCard>

            <LoadingThenSuccessModal
                visible={!!submitModalVisible}
                onClose={onSubmissionModalClose || (() => {})}
                loading={!!submitLoading && !submitSuccess}
                title="Request Submitted!"
                description="You'll receive a quote within 24 hours."


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

export default AlaseBookingSummary;
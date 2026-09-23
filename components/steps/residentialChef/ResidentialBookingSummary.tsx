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

interface ResidentialBookingSummaryProps {
  bookingSummary: any;
  paymentBreakdown?: {
    testingFee: number;
    monthlyPlanAmount: number;
    menuTotalPrice: number;
    serviceCharge: number;
    vat: number;
    transportationCost: number;
    dueTodayTotal: number;
    futureMonthlyRenewal: number;
  };
  submitLoading?: boolean;
  submitSuccess?: boolean;
  submitModalVisible?: boolean;
  onSubmissionModalClose?: () => void;
}

const ResidentialBookingSummary: React.FC<ResidentialBookingSummaryProps> = ({
  bookingSummary,
  paymentBreakdown,
  submitLoading,
  submitSuccess,
  submitModalVisible,
  onSubmissionModalClose,
}) => {
  const testingFee = Number(paymentBreakdown?.testingFee ?? bookingSummary?.selectedChefLevel?.basePriceMinor ?? 0);
  const monthlyPlanAmount = Number(paymentBreakdown?.monthlyPlanAmount ?? bookingSummary?.serviceFreq?.fee ?? bookingSummary?.selectedChefLevel?.monthlySubFee ?? 0);
  const menuTotalPrice = Number(paymentBreakdown?.menuTotalPrice ?? bookingSummary?.menuTotalPrice ?? 0);
  const serviceCharge = Number(paymentBreakdown?.serviceCharge ?? bookingSummary?.serviceCharge ?? 0);
  const vat = Number(paymentBreakdown?.vat ?? bookingSummary?.vat ?? 0);
  const transportationCost = Number(paymentBreakdown?.transportationCost ?? bookingSummary?.transportationCost ?? 0);
  const totalBookingCost = Number(paymentBreakdown?.dueTodayTotal ?? bookingSummary?.totalBookingCost ?? 0);
  const futureMonthlyRenewal = Number(paymentBreakdown?.futureMonthlyRenewal ?? monthlyPlanAmount ?? 0);
  const selectedFrequency = Number(bookingSummary?.serviceFreq?.frequency || 0);
  const monthlyPlanLabel = selectedFrequency > 0 ? `${selectedFrequency} times weekly monthly plan` : "Monthly plan";
  const isInstantPayment = String(bookingSummary?.paymentOption || "").toLowerCase() === "instant";

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
          <Image source={receiptIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </IconWrapper>
        <SectionText text="Booking Summary" />
        <BodyText text="Here is a summary of your residential booking." />

        {/* {isInstantPayment && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: "#ECFDF3",
              borderColor: "#ABEFC6",
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <BodyText text="Instant Payment" textStyle={{ color: "#067647" }} />
          </View>
        )} */}
      </FrameCard>

      <FrameCard>
        <SectionText text="Your residential service" />
        <View style={styles.row}>
          <BodyText text="Chef level" />
          <BodyText text={`${bookingSummary?.selectedChefLevel?.chefCatName || "-"}`} />
        </View>

        <View style={styles.row}>
          <BodyText text="Frequency" />
          <BodyText text={`${bookingSummary?.serviceFreq?.frequency || "-"} times weekly`} />
        </View>

        <View style={styles.row}>
          <BodyText text="Service time" />
          <BodyText text={`${bookingSummary?.timeRange || "-"}`} />
        </View>
      </FrameCard>

      {isInstantPayment && (
        <FrameCard>
          <SectionText text="Payments due today" />
          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <BodyText text="3-day testing fee" />
              <BodyText text={`${convertToThousand(testingFee)}`} />
            </View>

            <View style={styles.row}>
              <BodyText text={monthlyPlanLabel} />
              <BodyText text={`${convertToThousand(monthlyPlanAmount)}`} />
            </View>

            <View style={styles.row}>
              <BodyText text="Groceries and ingredients" />
              <BodyText text={`${convertToThousand(menuTotalPrice)}`} />
            </View>

            <View style={styles.row}>
              <BodyText text="Service charge (10%)" />
              <BodyText text={`${convertToThousand(serviceCharge)}`} />
            </View>

            <View style={styles.row}>
              <BodyText text="VAT (7.5%)" />
              <BodyText text={`${convertToThousand(vat)}`} />
            </View>

            <View style={styles.row}>
              <BodyText text="Transportation" />
              <BodyText text={`${convertToThousand(transportationCost)}`} />
            </View>
            <BodyText text="Your first month is included in today's payment." />


          </View>

          <View style={styles.totalCard}>
            <SectionText text="Total due today" />
            <SectionText text={`${convertToThousand(totalBookingCost)}`} textStyle={{ color: "#12B76A" }} />
          </View>
        </FrameCard>

        
      )}

      <FrameCard>
          <SectionText text="Future monthly renewal" />
          <View style={styles.breakdownCard}>
            <View style={styles.row}>
              <BodyText text={monthlyPlanLabel} />
              <BodyText text={`${convertToThousand(futureMonthlyRenewal)}`} />
            </View>

            <View style={styles.row}>
              <SectionText text="Total monthly renewal" />
              <BodyText text={`${convertToThousand(futureMonthlyRenewal)}`} />
            </View>
            <BodyText text="Groceries, ingredients, and one-time setup fees are not included in monthly renewals." />


          </View>

          <View style={styles.totalCard}>
            <SectionText text="Monthly renewal due" />
            <SectionText text={`${convertToThousand(futureMonthlyRenewal)}`} textStyle={{ color: "#12B76A" }} />
          </View>
        </FrameCard>

      <LoadingThenSuccessModal
        visible={!!submitModalVisible}
        onClose={onSubmissionModalClose || (() => { })}
        loading={!!submitLoading && !submitSuccess}
        title={isInstantPayment ? "Booking Successful!" : "Quote Request Submitted!"}
        description={isInstantPayment ? "Your residential chef booking is locked in." : "We'll send your quote within 24 hours."}
      />
    </>
  );
};

const styles = ScaledSheet.create({
  titleCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  breakdownCard: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    gap: 10,
  },
  totalCard: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ResidentialBookingSummary;

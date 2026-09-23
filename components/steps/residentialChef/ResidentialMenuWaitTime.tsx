import React, { useEffect, useState } from "react";
import { View } from "react-native";
import FrameCard from "@/components/cards/FrameCard";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import { router } from "expo-router";
import PrimaryLoader from "@/components/Loader";
import { createBookingNumberWaitTime } from "@/services/bookingNumber";

interface ResidentialMenuWaitTimeProps {
  title?: string;
  description?: string;
  chefLevelName?: string;
  bookingWaitNumber: string;
  serviceId: string;
  customerId: string;

  onBookingWaitNumberChange: (nextValue: string) => void;
  onFieldTouched?: (fieldName: "generatedWaitingNumber") => void;
  errors?: {
    generatedWaitingNumber?: string;
  };
  touched?: {
    generatedWaitingNumber?: boolean;
  };
}

const ResidentialMenuWaitTime: React.FC<ResidentialMenuWaitTimeProps> = ({
  title = "Your match is next",
  description = "Generating your matching queue number...",
  chefLevelName,
  bookingWaitNumber,
  serviceId,
  customerId,
  onBookingWaitNumberChange,
  onFieldTouched,
}) => {
  const [generatedWaitingNumber, setGeneratedWaitingNumber] = useState(bookingWaitNumber || "");
  const [isCreatingWaitNumber, setIsCreatingWaitNumber] = useState(false);

  const handleSetGeneratedWaitingNumber = (nextValue: string) => {
    setGeneratedWaitingNumber(nextValue);
    onBookingWaitNumberChange(nextValue);
    if (onFieldTouched) {
      onFieldTouched("generatedWaitingNumber");
    }
  };

  useEffect(() => {
    if (bookingWaitNumber && bookingWaitNumber !== generatedWaitingNumber) {
      setGeneratedWaitingNumber(bookingWaitNumber);
    }
  }, [bookingWaitNumber, generatedWaitingNumber]);

  useEffect(() => {
    let isMounted = true;

    const createWaitNumber = async () => {
      if (!serviceId || !customerId || bookingWaitNumber) {
        return;
      }

      setIsCreatingWaitNumber(true);

      try {
        const response = await createBookingNumberWaitTime({ serviceId, customerId });
        const nextValue = String(response?.assignedNumber || "");

        if (!isMounted || !nextValue) {
          return;
        }

        handleSetGeneratedWaitingNumber(nextValue);
      } catch (error) {
        if (isMounted) {
          console.log("Failed to create booking waiting number", error);
        }
      } finally {
        if (isMounted) {
          setIsCreatingWaitNumber(false);
        }
      }
    };

    createWaitNumber();

    return () => {
      isMounted = false;
    };
  }, [serviceId, customerId, bookingWaitNumber]);

  const displayQueueNumber = generatedWaitingNumber || bookingWaitNumber;
  const queueDescription = displayQueueNumber
    ? `You are number ${displayQueueNumber} in the matching queue.`
    : description;

  return (
    <>
      <FrameCard style={{ alignItems: "center" }}>
        <SectionText text={title} />
        {isCreatingWaitNumber && !displayQueueNumber ? (
          <View>
            <PrimaryLoader />
          </View>
        ) : (
          <>
            <BodyText text={queueDescription} textStyle={{ textAlign: "center" }} />

            <BodyText
              text={`After payment, our operations team will match and assign a ${chefLevelName || "chef"} for your 3-day testing phase, usually within 7 days.`}
              textStyle={{ textAlign: "center", marginTop: 8 }}
            />

            <View
              style={{
                marginTop: 20,
                backgroundColor: "#f3f7ff",
                width: "100%",
                padding: 10,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 5,
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#0d2e72" />
              <View style={{ flex: 1, backgroundColor: "transparent", maxWidth: "90%" }}>
                <BodyText
                  textStyle={{ color: "#0d2e72" }}
                  text="You are booking a chef level, not a named chef. We use your preferences and availability to make the assignment."
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 20,
                backgroundColor: "#fff5db",
                width: "100%",
                padding: 10,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 5,
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#2a1a04" />
              <View style={{ flex: 1, backgroundColor: "transparent", maxWidth: "90%" }}>
                <SectionText textStyle={{ color: "#2a1a04" }} text="Need a chef urgently?" />

                <BodyText
                  textStyle={{ color: "#2a1a04" }}
                  text="For a quicker one-off booking, try Daily Chef Service."
                />
                <PrimaryActionButton
                  onPress={() => {
                    router.push("/(dashboard)");
                  }}
                  textStyle={{ color: "#2a1a04", fontWeight: "bold" }}
                  style={{ backgroundColor: "#fcfbf9", borderWidth: 1, padding: 0, marginTop: 5 }}
                  title="Book Daily Chef"
                />
              </View>
            </View>
          </>
        )}
      </FrameCard>
    </>
  );
};

export default ResidentialMenuWaitTime;

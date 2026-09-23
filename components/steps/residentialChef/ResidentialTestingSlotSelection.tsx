import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import moment from "moment";
import FrameCard from "@/components/cards/FrameCard";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { generateLocalTestingSlots, getResidentialTestingSlots, IResidentialTestingSlot } from "@/services/residentialTestingSlotService";

interface ResidentialTestingSlotSelectionProps {
  selectedStartDate?: string;
  onChange: (slot: { startDate: string; endDate: string }) => void;
  error?: string;
  touched?: boolean;
}

const formatRange = (startDate: string, endDate: string) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const sameMonth = start.format("MMM") === end.format("MMM");

  return sameMonth
    ? `${start.format("Do")} - ${end.format("Do MMM YYYY")}`
    : `${start.format("Do MMM")} - ${end.format("Do MMM YYYY")}`;
};

const ResidentialTestingSlotSelection: React.FC<ResidentialTestingSlotSelectionProps> = ({
  selectedStartDate,
  onChange,
  error,
  touched,
}) => {
  // Always start from locally-computed slots so date selection is never
  // blocked on the live-capacity endpoint being reachable (e.g. not yet
  // deployed to the environment this build points at).
  const [slots, setSlots] = useState<IResidentialTestingSlot[]>(() => generateLocalTestingSlots());

  useEffect(() => {
    const fetchLiveCapacity = async () => {
      try {
        const response = await getResidentialTestingSlots();
        if (response.length) {
          setSlots(response);
        }
      } catch {
        // Endpoint not available on this environment yet — keep the local
        // fallback slots (shown as fully open) rather than blocking the client.
      }
    };

    fetchLiveCapacity();
  }, []);

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <SectionText text="Preferred Testing Slot" />
        <BodyText
          text="Pick a 5-day window for your chef's 3-day testing phase. Each slot fits up to 5 clients — once a slot is full, choose the next available one."
          textStyle={{ textAlign: "center" }}
        />
        {!!(touched && error) && <BodyText text={error} textStyle={{ color: "#B42318" }} />}
      </FrameCard>

      <FrameCard>
        {slots.length === 0 ? (
          <BodyText text="No testing slots available right now. Please check back shortly." textStyle={{ textAlign: "center" }} />
        ) : (
          slots.map((slot) => {
            const selected = selectedStartDate === slot.startDate;

            return (
              <Pressable
                key={slot.startDate}
                disabled={slot.isFull}
                onPress={() => onChange({ startDate: slot.startDate, endDate: slot.endDate })}
                style={[
                  styles.slotCard,
                  selected && styles.slotCardSelected,
                  slot.isFull && styles.slotCardDisabled,
                ]}
              >
                <View style={styles.slotIconWrap}>
                  <Ionicons name="calendar-outline" size={20} color={slot.isFull ? "#9CA3AF" : "#111827"} />
                </View>
                <View style={{ flex: 1 }}>
                  <SectionText
                    text={formatRange(slot.startDate, slot.endDate)}
                    textStyle={slot.isFull ? { color: "#9CA3AF" } : undefined}
                  />
                  <BodyText
                    text={slot.isFull ? "Slot full" : `${slot.remaining} of ${slot.capacity} spots left`}
                    textStyle={{ color: slot.isFull ? "#B42318" : "#6B7280", fontSize: 12 }}
                  />
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color="#12B76A" />}
              </Pressable>
            );
          })
        )}
      </FrameCard>
    </>
  );
};

const styles = ScaledSheet.create({
  titleCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: "12@ms",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: "10@ms",
    backgroundColor: "#F9FAFB",
    marginBottom: "10@vs",
  },
  slotCardSelected: {
    borderColor: "#12B76A",
    backgroundColor: "#ECFDF3",
  },
  slotCardDisabled: {
    opacity: 0.6,
  },
  slotIconWrap: {
    width: "36@ms",
    height: "36@ms",
    borderRadius: "18@ms",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});

export default ResidentialTestingSlotSelection;

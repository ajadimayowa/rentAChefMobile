import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "@/components/cards/FrameCard";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import TimePickerModal from "@/components/modals/calendar/TimePickerModal";
import ListPickerModal from "@/components/modals/calendar/ListPickerModal";
import ListObjectPickerModal from "@/components/modals/calendar/ListObjectPickerModal";
import NoticeModal from "@/components/modals/NoticeModal";
import ValueActionButton from "@/components/buttons/ValueActionButton";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import Toast from "react-native-toast-message";
import clockIcon from "../../../assets/icons/clockIcon.png";

interface ResidentialBookingOptionsProps {
  prefferedCuisine: string[];
  chefLevelName?: string;
  chefGenderPreference: string;
  serviceFrequency: {
    frequency: number | string;
    fee: number;

  };
  chefComeInDays: string[];
  prefTimeOfDay: string;
  breakFastTime: Date | undefined;
  lunchTime: Date | undefined;
  dinnerTime: Date | undefined;
  onPrefferedCuisineChange: (nextValue: string[]) => void;
  onChefGenderPreferenceChange: (nextValue: string) => void;
  onServiceFrequencyChange: (nextValue: { frequency: number; fee: number }) => void;
  onChefComeInDaysChange: (nextValue: string[]) => void;
  onPrefTimeOfDayChange: (nextValue: string) => void;
  onBreakFastTimeChange: (nextValue: Date | undefined) => void;
  onLunchTimeChange: (nextValue: Date | undefined) => void;
  onDinnerTimeChange: (nextValue: Date | undefined) => void;
  onFieldTouched?: (fieldName: "prefferedCuisine" | "chefGenderPreference" | "serviceFrequency" | "chefComeInDays" | "prefTimeOfDay" | "breakFastTime" | "lunchTime" | "dinnerTime") => void;
  errors?: {
    prefferedCuisine?: string;
    chefComeInDays?: string;
    breakFastTime?: string;
    lunchTime?: string;
    dinnerTime?: string;
  };
  touched?: {
    prefferedCuisine?: boolean;
    chefComeInDays?: boolean;
    breakFastTime?: boolean;
    lunchTime?: boolean;
    dinnerTime?: boolean;
  };
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

const CUISINE_OPTIONS = ["Continental", "Intercontinental", "National", "Local"];

// Junior chefs only cover continental/local dishes, Sous chefs add national
// dishes but not intercontinental, and Pro chefs (and any other/unlisted
// level) have every cuisine available.
const getAllowedCuisines = (chefLevelName?: string): string[] => {
  const name = (chefLevelName || "").toLowerCase();
  if (name.includes("junior")) return ["Continental", "Local"];
  if (name.includes("sous")) return ["Continental", "National", "Local"];
  return CUISINE_OPTIONS;
};

// Parses the "H:MM AM/PM" end of a "8:00 AM - 4:00 PM" style slot into a
// Date carrying just that time-of-day (today's date, hour/minute set).
const parseTimeSlotEnd = (slot?: string): Date | undefined => {
  if (!slot) return undefined;

  const endPart = slot.split("-")[1]?.trim();
  const match = endPart?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return undefined;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const result = new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const isTimeAfter = (time: Date, cutoff: Date): boolean => {
  const timeMinutes = time.getHours() * 60 + time.getMinutes();
  const cutoffMinutes = cutoff.getHours() * 60 + cutoff.getMinutes();
  return timeMinutes > cutoffMinutes;
};

const ResidentialBookingOptions: React.FC<ResidentialBookingOptionsProps> = ({
  prefferedCuisine,
  chefLevelName,
  chefGenderPreference,
  serviceFrequency,
  chefComeInDays,
  prefTimeOfDay,
  breakFastTime,
  lunchTime,
  dinnerTime,
  onPrefferedCuisineChange,
  onChefGenderPreferenceChange,
  onServiceFrequencyChange,
  onChefComeInDaysChange,
  onPrefTimeOfDayChange,
  onBreakFastTimeChange,
  onLunchTimeChange,
  onDinnerTimeChange,
  onFieldTouched,
  errors,
  touched,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  const [showServiceTimePicker, setShowServiceTimePicker] = useState(false);

  const [showChefGenderPref, setShowChefGenderPref] = useState(false);
  const [showServiceFreqPref, setShowServiceFreqPref] = useState(false);
  const [showPrefTimeOfDay, setShowPrefTimeOfDay] = useState(false);

  const [showBreakfastTime, setShowBreakfastTime] = useState(false);
  const [showLunchTime, setShowLunchTime] = useState(false);
  const [showDinnerTime, setShowDinnerTime] = useState(false);

  const [showDinnerTimeNotice, setShowDinnerTimeNotice] = useState(false);

  const [showDietaryPreferences, setShowDietaryPreferences] = useState(false);

  const allowedCuisines = useMemo(() => getAllowedCuisines(chefLevelName), [chefLevelName]);
  const maxDinnerTime = useMemo(() => parseTimeSlotEnd(prefTimeOfDay), [prefTimeOfDay]);

  // If the client downgrades their chef level after already picking cuisines,
  // drop any selections that are no longer available at the new level.
  useEffect(() => {
    const filtered = prefferedCuisine.filter((cuisine) => allowedCuisines.includes(cuisine));
    if (filtered.length !== prefferedCuisine.length) {
      onPrefferedCuisineChange(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chefLevelName]);

  const formatDate = (value?: Date) => {
    if (!value) return "Possible start date";
    return value.toLocaleDateString();
  };

  const formatTime = (value?: Date, label?: string) => {
    if (!value) return label || "Select time";
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleDay = (day: string) => {
    const hasDay = chefComeInDays.includes(day);
    const nextDays = hasDay ? chefComeInDays.filter((item) => item !== day) : [...chefComeInDays, day];
    onChefComeInDaysChange(nextDays);
    onFieldTouched?.("chefComeInDays");
  };

  const toggleCuisine = (cuisine: string) => {
    const hasCuisine = prefferedCuisine.includes(cuisine);
    const nextCuisines = hasCuisine
      ? prefferedCuisine.filter((item) => item !== cuisine)
      : [...prefferedCuisine, cuisine];
    onPrefferedCuisineChange(nextCuisines);
    onFieldTouched?.("prefferedCuisine");
  };

  const handleDinnerTimePress = () => {
    if (maxDinnerTime) {
      setShowDinnerTimeNotice(true);
      return;
    }
    setShowDinnerTime(true);
  };

  const handleDinnerNoticeDismiss = () => {
    setShowDinnerTimeNotice(false);
    setShowDinnerTime(true);
  };

  const handleDinnerTimeSelect = (selected: Date) => {
    if (maxDinnerTime && isTimeAfter(selected, maxDinnerTime)) {
      Toast.show({
        type: "error",
        text1: "Dinner time not available",
        text2: `Dinner must be prepared before ${formatTime(maxDinnerTime)} based on your selected time slot.`,
      });
      return;
    }

    onDinnerTimeChange?.(selected);
    onFieldTouched?.("dinnerTime");
  };

  return (
    <>
      <FrameCard style={{ alignItems: "center" }}>
        <SectionText text="Service options" />
        <BodyText text="Select the options that fits your need." textStyle={{ textAlign: "center" }} />
      </FrameCard>

      <FrameCard>
        <SectionText text="Preferred Cuisine (select all that apply)" />
        <View style={styles.daysWrap}>
          {allowedCuisines.map((cuisine) => {
            const selected = prefferedCuisine.includes(cuisine);

            return (
              <Pressable key={cuisine} style={styles.cuisineChip} onPress={() => toggleCuisine(cuisine)}>
                <View style={[styles.checkboxBase, selected ? styles.checkboxChecked : null]} />
                <BodyText text={cuisine} />
              </Pressable>
            );
          })}
        </View>
        {allowedCuisines.length < CUISINE_OPTIONS.length && (
          <BodyText
            text={`Based on your selected chef level, only ${allowedCuisines.join(", ")} cuisines are available.`}
            textStyle={{ color: "#6B7280", fontSize: 12, marginTop: 6 }}
          />
        )}
        {!!touched?.prefferedCuisine && !!errors?.prefferedCuisine && (
          <BodyText text={String(errors.prefferedCuisine)} textStyle={{ color: "#B42318", marginTop: 8 }} />
        )}

        <SelectActionButton
          value={chefGenderPreference || ""}
          onPress={() => setShowChefGenderPref(true)}
          label="Chef Gender Preference"
        />

        <SectionText text="Service Frequency" textStyle={{ marginVertical: 10 }} />
        <ValueActionButton
          value={String(serviceFrequency.fee) || ""}
          title={serviceFrequency.frequency ? `${serviceFrequency.frequency} Times Weekly` : "Service Frequency"}
          onPress={() => setShowServiceFreqPref(true)}
          label="Service Frequency"
        />

        <SectionText text="Choose chef come in days." textStyle={{ marginTop: 18 }} />
        <View style={styles.daysWrap}>
          {WEEK_DAYS.map((day) => {
            const selected = chefComeInDays.includes(day);

            return (
              <Pressable key={day} style={styles.dayChip} onPress={() => toggleDay(day)}>
                <View style={[styles.checkboxBase, selected ? styles.checkboxChecked : null]} />
                <BodyText text={day} />
              </Pressable>
            );
          })}
        </View>
        {!!touched?.chefComeInDays && !!errors?.chefComeInDays && (
          <BodyText text={String(errors.chefComeInDays)} textStyle={{ color: "#B42318", marginTop: 8 }} />
        )}

        {chefComeInDays.includes("Sun") && (
          <View style={styles.alertCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#B45309" />
            <BodyText
              text="Sunday Service Notice: *Kindly note that our chefs do not typically work on Sundays. However, Sunday service is available upon request and attracts an additional fee of ₦50,000 per Sunday."
              textStyle={{ color: "#92400E", flex: 1 }}
            />
          </View>
        )}

        <SelectActionButton
          value={prefTimeOfDay || ""}
          onPress={() => setShowPrefTimeOfDay(true)}
          label="Preferred Time Slot"
        />

        <SectionText text="Breakfast Time" textStyle={{ marginTop: 18 }} />
        <PrimaryActionButton
          title={breakFastTime ? `${formatTime(breakFastTime)}` : "Select Time"}
          icon={
            <Image
              source={clockIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          }
          onPress={() => {
            setShowBreakfastTime(true);
          }}
        />

        <SectionText text="Lunch Time" textStyle={{ marginTop: 18 }} />
        <PrimaryActionButton
          title={lunchTime ? `${formatTime(lunchTime)}` : "Select Time"}
          icon={
            <Image
              source={clockIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          }
          onPress={() => {
            setShowLunchTime(true);
          }}
        />

        <SectionText text="Dinner Time" textStyle={{ marginTop: 18 }} />
        <PrimaryActionButton
          title={dinnerTime ? `${formatTime(dinnerTime)}` : "Select Time"}
          icon={
            <Image
              source={clockIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          }
          onPress={handleDinnerTimePress}
        />
        {maxDinnerTime && (
          <BodyText
            text={`Dinner must be prepared before ${formatTime(maxDinnerTime)} based on your selected time slot.`}
            textStyle={{ color: "#6B7280", fontSize: 12, marginTop: 6 }}
          />
        )}
      </FrameCard>

      <ListPickerModal
        visible={showChefGenderPref}
        onClose={() => setShowChefGenderPref(false)}
        title="Preferred Chef Gender"
        options={["Male", "Female", "No Preference"]}
        onSelect={(selectedOption) => {
          onChefGenderPreferenceChange(selectedOption);
          onFieldTouched?.("chefGenderPreference");
          setShowChefGenderPref(false);
        }}
      />

      <ListObjectPickerModal
        visible={showServiceFreqPref}
        onClose={() => setShowServiceFreqPref(false)}
        title="Service Frequency"
        options={[
          { id: "3 Times Weekly", name: "3 Times Weekly", value: "5000" },
          { id: "4 Times Weekly", name: "4 Times Weekly", value: "500000" },
          { id: "5 Times Weekly", name: "5 Times Weekly", value: "550000" },
        ]}
        onSelect={(selectedOption) => {
          onServiceFrequencyChange({ frequency: Number(selectedOption.name.split(" ")[0]), fee: Number(selectedOption.value) });
          onFieldTouched?.("serviceFrequency");
          setShowServiceFreqPref(false);
        }}
      />

      <ListPickerModal
        visible={showPrefTimeOfDay}
        onClose={() => setShowPrefTimeOfDay(false)}
        title="Preferred Time Slot"
        options={["8:00 AM - 4:00 PM", "9:00 AM - 5:00 PM", "10:00 AM - 6:00 PM", "11:00 AM - 7:00 PM", "12:00 PM - 8:00 PM"]}
        onSelect={(selectedOption) => {
          onPrefTimeOfDayChange(selectedOption);
          onFieldTouched?.("prefTimeOfDay");
          setShowPrefTimeOfDay(false);
        }}
      />

      <TimePickerModal
        visible={showBreakfastTime}
        title="Breakfast Time"
        time={breakFastTime}
        onClose={() => setShowBreakfastTime(false)}
        onSelectTime={(time) => {
          onBreakFastTimeChange?.(time);
        }}
      />

      <TimePickerModal
        visible={showLunchTime}
        title="Lunch Time"
        time={lunchTime}
        onClose={() => setShowLunchTime(false)}
        onSelectTime={(time) => {
          onLunchTimeChange?.(time);
        }}
      />

      <TimePickerModal
        visible={showDinnerTime}
        title="Dinner Time"
        time={dinnerTime}
        maximumTime={maxDinnerTime}
        onClose={() => setShowDinnerTime(false)}
        onSelectTime={handleDinnerTimeSelect}
      />

      <NoticeModal
        visible={showDinnerTimeNotice}
        onClose={handleDinnerNoticeDismiss}
        title="Dinner Time Notice"
        message={`*kindly note that your selected chef service ends at ${formatTime(maxDinnerTime)}. Dinner must be prepared before then. If you plan to eat later, your dinner will be prepared in advance and preserved for you.`}
      />
    </>
  );
};

const styles = ScaledSheet.create({
  checkboxRowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: "10@vs",
    backgroundColor: "transparent",
  },
  checkableInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  checkboxBase: {
    width: "20@ms",
    height: "20@ms",
    borderRadius: "4@ms",
    borderWidth: 1,
    borderColor: "#98A2B3",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  daysWrap: {
    marginTop: "10@vs",
    width: "100%",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: "10@ms",
    padding: "10@ms",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    backgroundColor: "#fff",
  },
  dayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "22%",
    backgroundColor: "transparent",
  },
  cuisineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
    backgroundColor: "transparent",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: "10@vs",
    padding: "10@ms",
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#F5A623",
    borderRadius: "10@ms",
  },
});

export default ResidentialBookingOptions;

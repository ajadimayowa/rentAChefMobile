import React from "react";
import { Pressable, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "@/components/cards/FrameCard";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import TimePickerModal from "@/components/modals/calendar/TimePickerModal";

interface ResidentialBookingOptionsProps {
    chefCanLiveIn: boolean;
    chefComeInDays: string[];
    startDate: Date | undefined;
    arrivalTime: Date | undefined;
    serviceTime: Date | undefined;
    onChefCanLiveInChange: (nextValue: boolean) => void;
    onChefComeInDaysChange: (nextValue: string[]) => void;
    onStartDateChange: (nextValue: Date | undefined) => void;
    onArrivalTimeChange: (nextValue: Date | undefined) => void;
    onServiceTimeChange: (nextValue: Date | undefined) => void;
    onFieldTouched?: (fieldName: "chefCanLiveIn" | "chefComeInDays" | "startDate" | "arrivalTime" | "serviceTime") => void;
    errors?: {
        chefComeInDays?: string;
        startDate?: string;
        arrivalTime?: string;
        serviceTime?: string;
    };
    touched?: {
        chefComeInDays?: boolean;
        startDate?: boolean;
        arrivalTime?: boolean;
        serviceTime?: boolean;
    };
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

const ResidentialBookingOptions: React.FC<ResidentialBookingOptionsProps> = ({
    chefCanLiveIn,
    chefComeInDays,
    startDate,
    arrivalTime,
    serviceTime,
    onChefCanLiveInChange,
    onChefComeInDaysChange,
    onStartDateChange,
    onArrivalTimeChange,
    onServiceTimeChange,
    onFieldTouched,
    errors,
    touched,
}) => {
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showArrivalTimePicker, setShowArrivalTimePicker] = React.useState(false);
    const [showServiceTimePicker, setShowServiceTimePicker] = React.useState(false);

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

    return (
        <>
            <FrameCard style={{ alignItems: "center" }}>
                <SectionText text="Service options" />
                <BodyText text="Select the options that fits your need." textStyle={{ textAlign: "center" }} />
            </FrameCard>

            <FrameCard>
                <SectionText text="Chef can live in?" />
                <View style={styles.checkboxRowInline}>
                    <Pressable
                        style={styles.checkableInline}
                        onPress={() => {
                            onChefCanLiveInChange(true);
                            onFieldTouched?.("chefCanLiveIn");
                        }}
                    >
                        <View style={[styles.checkboxBase, chefCanLiveIn ? styles.checkboxChecked : null]} />
                        <BodyText text="Yes" />
                    </Pressable>

                    <Pressable
                        style={styles.checkableInline}
                        onPress={() => {
                            onChefCanLiveInChange(false);
                            onFieldTouched?.("chefCanLiveIn");
                        }}
                    >
                        <View style={[styles.checkboxBase, !chefCanLiveIn ? styles.checkboxChecked : null]} />
                        <BodyText text="No" />
                    </Pressable>
                </View>

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

                <View style={{ marginTop: 14 }}>
                    <SelectActionButton
                        label=""
                        value={formatDate(startDate)}
                        onPress={() => {
                            onFieldTouched?.("startDate");
                            setShowDatePicker(true);
                        }}
                    />
                    {!!touched?.startDate && !!errors?.startDate && (
                        <BodyText text={String(errors.startDate)} textStyle={{ color: "#B42318" }} />
                    )}

                    <SelectActionButton
                        label=""
                        value={formatTime(arrivalTime, "Select arrival time")}
                        onPress={() => {
                            onFieldTouched?.("arrivalTime");
                            setShowArrivalTimePicker(true);
                        }}
                    />
                    {!!touched?.arrivalTime && !!errors?.arrivalTime && (
                        <BodyText text={String(errors.arrivalTime)} textStyle={{ color: "#B42318" }} />
                    )}

                    <SelectActionButton
                        label=""
                        value={formatTime(serviceTime, "Select service time")}
                        onPress={() => {
                            onFieldTouched?.("serviceTime");
                            setShowServiceTimePicker(true);
                        }}
                    />
                    {!!touched?.serviceTime && !!errors?.serviceTime && (
                        <BodyText text={String(errors.serviceTime)} textStyle={{ color: "#B42318" }} />
                    )}
                </View>
            </FrameCard>

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={startDate}
                onSelectDate={(date) => onStartDateChange(date)}
            />
            <TimePickerModal
                visible={showArrivalTimePicker}
                onClose={() => setShowArrivalTimePicker(false)}
                time={arrivalTime}
                onSelectTime={(date) => onArrivalTimeChange(date)}
            />
            <TimePickerModal
                visible={showServiceTimePicker}
                onClose={() => setShowServiceTimePicker(false)}
                time={serviceTime}
                onSelectTime={(date) => onServiceTimeChange(date)}
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
});

export default ResidentialBookingOptions;
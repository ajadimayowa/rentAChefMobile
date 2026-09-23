import React, { useState } from "react";
import { Image, TextInput } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import calendarIcon from "../../../assets/icons/wineGls (1).png";
import BodyText from "../../typography/BodyText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import calendarSmall from "../../../assets/icons/calendarSmall.png";
import clockIcon from "../../../assets/icons/clockIcon.png";
import eventCapIcon from "../../../assets/icons/baloonIcon.png";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import TimePickerModal from "@/components/modals/calendar/TimePickerModal";
import MultiStepInput from "@/components/inputs/MultiStepInputType";
import EventTypePickerModal from "@/components/modals/calendar/EventTypePickerModal";

interface EventCateringBriefDataProps {
    eventType: string;
    noOfGuests: number | null;
    addressOfEvent: string;

    additionalNotes: string;

    onEventTypeChange?: (nextValue: string) => void;

    onNoOfGuestsChange: (nextValue: number | null) => void;
    onAddressOfEventChange: (nextValue: string) => void;
    onEndDateChange?: (nextValue: Date | undefined) => void;
    onArrivalTimeChange?: (nextValue: Date | undefined) => void;
    onServiceTimeChange?: (nextValue: Date | undefined) => void;
    onAdditionalNotesChange: (nextValue: string) => void;
    error?: string;
    touched?: boolean;
}

const formatDate = (value?: Date) => {
    if (!value) return "-";
    return value.toLocaleDateString();
};

const formatTime = (value?: Date) => {
    if (!value) return "-";
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};


const EventCateringBriefData: React.FC<EventCateringBriefDataProps> = ({
    eventType,
    noOfGuests,onEventTypeChange,additionalNotes, addressOfEvent, onAdditionalNotesChange,onAddressOfEventChange, onNoOfGuestsChange, error, touched
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
    const [showServiceTimePicker, setShowServiceTimePicker] = useState(false);
    const [showEventTypePicker, setShowEventTypePicker] = useState(false);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={calendarIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Event Catering Details" />
                <BodyText textStyle={{ textAlign: 'center' }} text={'Fill in the information for your event'} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard>
                <PrimaryActionButton
                    title={eventType || "Select Event Type"}
                    icon={
                        <Image
                            source={eventCapIcon}
                            style={{ width: 24, height: 24, marginRight: 10 }}
                            resizeMode="contain"
                        />
                    }
                    onPress={() => setShowEventTypePicker(true)}
                />
                {
                    eventType &&
                    <>
                        <View style={{ marginTop: 30 }}>
                            <MultiStepInput
                                label="Number of guests"
                                value={noOfGuests == null ? "" : String(noOfGuests)}
                                inputType="number"
                                onChangeText={(text) => {
                                    if (text === "") {
                                        onNoOfGuestsChange?.(null);
                                        return;
                                    }

                                    // Only allow digits
                                    if (!/^\d+$/.test(text)) {
                                        return;
                                    }

                                    onNoOfGuestsChange?.(Number(text));
                                }}
                                placeholder="Enter number of guests"
                                error={touched && error ? error : undefined}
                            />

                        </View>

                        <View>
                            <MultiStepInput
                                label="Location of Event"
                                inputType="multiline"
                                value={addressOfEvent}
                                onChangeText={(nextValue) => onAddressOfEventChange?.(nextValue)}
                                placeholder="Enter event address"
                                error={touched && error ? error : undefined}
                            />

                        </View>

                        <View>
                            <MultiStepInput
                                label={`Special Note`}
                                inputType="multiline"
                                value={additionalNotes}
                                onChangeText={(nextValue) => onAdditionalNotesChange?.(nextValue)}
                                placeholder="Enter any special requests or dietary notes"
                                error={touched && error ? error : undefined}
                            />

                        </View>
                    </>
                }
            </FrameCard>

            <EventTypePickerModal
                visible={showEventTypePicker}
                onClose={() => setShowEventTypePicker(false)}
                onSelectEventType={(eventType) => {
                    onEventTypeChange?.(eventType);
                }}
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
    },
    textInput: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginTop: 12,
        backgroundColor: "#fff",
    },
});

export default EventCateringBriefData;
import React, { useState } from "react";
import { Image, TextInput } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import calendarIcon from "../../../assets/icons/proteinoptions/calendarIcon.png";
import BodyText from "../../typography/BodyText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import calendarSmall from "../../../assets/icons/calendarSmall.png";
import clockIcon from "../../../assets/icons/clockIcon.png";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import TimePickerModal from "@/components/modals/calendar/TimePickerModal";
import MultiStepInput from "@/components/inputs/MultiStepInputType";

interface DailyChefEventDetailsProps {
    startDate: Date | undefined
    endDate?: Date | undefined
    arrivalTime: Date | undefined
    serviceTime: Date | undefined
    addressOfEvent: string;
    onStartDateChange: (nextValue: Date | undefined) => void;
    onEndDateChange?: (nextValue: Date | undefined) => void;
    onArrivalTimeChange?: (nextValue: Date | undefined) => void;
    onServiceTimeChange?: (nextValue: Date | undefined) => void;
    onAddressOfEventChange: (nextValue: string) => void;
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


const DailyChefEventDetails: React.FC<DailyChefEventDetailsProps> = ({
    startDate, arrivalTime, serviceTime, addressOfEvent, onStartDateChange, onArrivalTimeChange, onServiceTimeChange, onAddressOfEventChange, error, touched
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
    const [showServiceTimePicker, setShowServiceTimePicker] = useState(false);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={calendarIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Event Details" />
                <BodyText textStyle={{ textAlign: 'center' }} text={'When and where is the event taking place?'} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard>
                <SectionText text="Event Date" />
                <PrimaryActionButton

                    title={startDate ? `${formatDate(startDate)}` : "Select Event Date"}
                    icon={
                        <Image
                            source={calendarSmall}
                            style={{ width: 20, height: 20 }}
                            resizeMode="contain"
                        />
                    }
                    onPress={() => {
                        setShowDatePicker(true);
                    }}
                />

                <View style={{ marginTop: 30, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '48%' }}>
                        <SectionText text="Arrival Time" />
                        <PrimaryActionButton
                            title={arrivalTime ? `${formatTime(arrivalTime)}` : "Select Time"}
                            icon={
                                <Image
                                    source={clockIcon}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                            }
                            onPress={() => {
                                setShowArrivalTimePicker(true);
                            }}
                        />
                    </View>
                    <View style={{ width: '48%' }}>
                        <SectionText text="Service Time" />
                        <PrimaryActionButton
                            title={serviceTime ? `${formatTime(serviceTime)}` : "Select Time"}
                            icon={
                                <Image
                                    source={clockIcon}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                            }
                            onPress={() => {
                                setShowServiceTimePicker(true);
                            }}
                        />
                    </View>

                </View>

                <View style={{ marginTop: 30}}>
                   <MultiStepInput
                        label="Location of Event"
                        inputType="multiline"
                        value={addressOfEvent}
                        onChangeText={(nextValue) => onAddressOfEventChange?.(nextValue)}
                        placeholder="Enter event address"
                        error={touched && error ? error : undefined}
                   />

                </View>
            </FrameCard>
            <DatePickerModal
                visible={showDatePicker}
                selectedDate={startDate}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={(date) => {
                    onStartDateChange?.(date);
                }}
            />

            <TimePickerModal
                visible={showArrivalTimePicker}
                time={arrivalTime}
                onClose={() => setShowArrivalTimePicker(false)}
                onSelectTime={(time) => {
                    onArrivalTimeChange?.(time);
                }}
            />
            <TimePickerModal
                visible={showServiceTimePicker}
                time={serviceTime}
                onClose={() => setShowServiceTimePicker(false)}
                onSelectTime={(time) => {
                    onServiceTimeChange?.(time);
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

export default DailyChefEventDetails;
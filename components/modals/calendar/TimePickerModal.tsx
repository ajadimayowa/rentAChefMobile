import React, { useState, useEffect } from "react";
import { Modal, View, Platform } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;

    /** Selected time */
    time?: Date;

    /** Only the hour/minute of these are used to bound the picker (iOS only — Android's native time dialog has no min/max support, so callers should still validate the selected time themselves). */
    minimumTime?: Date;
    maximumTime?: Date;

    /** Returns selected Date */
    onSelectTime: (date: Date) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
    visible,
    onClose,
    title = "Select Time",
    time,
    minimumTime,
    maximumTime,
    onSelectTime,
}) => {
    const [selectedTime, setSelectedTime] = useState<Date>(
        time || new Date()
    );

    useEffect(() => {
        if (time) {
            setSelectedTime(time);
        }
    }, [time]);

    const onChange = (_: any, date?: Date) => {
        if (!date) return;
        setSelectedTime(date);

        // Android closes automatically
        if (Platform.OS === "android") {
            onSelectTime(date);
            onClose();
        }
    };

    const handleDone = () => {
        onSelectTime(selectedTime);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <SectionText text={title}/>

                        <IconButton
                            icon="close"
                            onPress={onClose}
                        />
                    </View>

                    <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onChange}
                        minimumDate={minimumTime}
                        maximumDate={maximumTime}
                    />

                    {Platform.OS === "ios" && (
                        <PrimaryActionButton
                        style={styles.button}
                        textStyle={{color:'#fff'}}
                            onPress={handleDone}
                            title="Done"
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.45)",
    },

    container: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: "20@ms",
        borderTopRightRadius: "20@ms",
        padding: "18@ms",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10@ms",
    },

    button: {
        marginTop: "15@ms",
        backgroundColor: "#050505ff"
    },
});

export default TimePickerModal;
import React, { useState, useEffect } from "react";
import { Modal, View, Platform, Image } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import ringIcon from "../../../assets/icons/ringIcon.png";
import briefCaseIcon from "../../../assets/icons/briefCaseIcon.png";
import cakeIcon from "../../../assets/icons/cakeIcon.png";
import starIcon from "../../../assets/icons/starIcon.png";

interface EventTypePickerModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;

    /** Selected time */
    time?: Date;

    /** Returns selected event type */
    onSelectEventType: (eventType: string) => void;
}

const EventTypePickerModal: React.FC<EventTypePickerModalProps> = ({
    visible,
    onClose,
    title = "Select Event Type",
    time,
    onSelectEventType,
}) => {
    const [selectedTime, setSelectedTime] = useState<Date>(
        time || new Date()
    );

    const eventTypes = [
        { id: 1, name: "Wedding Event", icon: ringIcon },
        { id: 2, name: "Birthday Party", icon: cakeIcon },
        { id: 3, name: "Corporate Event", icon: briefCaseIcon },
        { id: 5, name: "Other", icon: starIcon },
    ];

    useEffect(() => {
        if (time) {
            setSelectedTime(time);
        }
    }, [time]);

    

    const handleDone = (eventType: string) => {
        onSelectEventType(eventType);
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

                    <View>
                        {eventTypes.map((eventType) => (
                            <PrimaryActionButton
                                key={eventType.id}
                                title={eventType.name}
                                icon={
                                    <Image
                                        source={eventType.icon}
                                        style={{ width: 24, height: 24, marginRight: 10 }}
                                        resizeMode="contain"
                                    />
                                }
                                onPress={() => {
                                    // Here you can handle the selection of the event type
                                    handleDone(eventType.name); // You might want to pass the selected event type instead
                                }}
                            />
                        ))}
                    </View>

                    {

                    }
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
        height: "50%",
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

export default EventTypePickerModal;
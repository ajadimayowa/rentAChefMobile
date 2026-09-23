import React, { useState, useEffect } from "react";
import { Modal, View, ScrollView } from "react-native";
import { IconButton } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";

interface EventTypePickerModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    options?: string[];

    /** Selected time */
    time?: Date;

    /** Returns selected event type */
    onSelect: (eventType: string) => void;
}

const ListPickerModal: React.FC<EventTypePickerModalProps> = ({
    visible,
    onClose,
    title = "Select Event Type",
    time,
    onSelect,
    options = []
}) => {
    const [selectedTime, setSelectedTime] = useState<Date>(
        time || new Date()
    );

    useEffect(() => {
        if (time) {
            setSelectedTime(time);
        }
    }, [time]);



    const handleDone = (val: string) => {
        onSelect(val);
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

                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {options?.map((val, index) => (
                            <PrimaryActionButton
                                key={`${val}-${index}`}
                                title={val}
                                style={styles.optionButton}
                                onPress={() => {
                                    // Here you can handle the selection of the event type
                                    handleDone(val); // You might want to pass the selected event type instead
                                }}
                            />
                        ))}
                    </ScrollView>
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

    list: {
        flex: 1,
    },

    optionButton: {
        marginBottom: "10@vs",
    },

    button: {
        marginTop: "15@ms",
        backgroundColor: "#050505ff"
    },
});

export default ListPickerModal;

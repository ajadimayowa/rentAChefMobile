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
import ValueActionButton from "@/components/buttons/ValueActionButton";

interface ListObjectPickerModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    options: { id: string; name: string; value:string }[];

    /** Selected time */
    time?: Date;

    /** Returns selected event type */
    onSelect: (eventType: { id: string; name: string; value: string }) => void;
}

const ListObjectPickerModal: React.FC<ListObjectPickerModalProps> = ({
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

    

    const handleDone = (val: { id: string; name: string; value: string }) => {
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

                    <View>
                        {options?.map((val, index) => (
                            <ValueActionButton
                            label={'Service Frequency'}
                                style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10}}
                                key={val.id}
                                title={val.name}
                                value={val.value}
                                onPress={() => {
                                    // Here you can handle the selection of the event type
                                    handleDone(val); // You might want to pass the selected event type instead
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

export default ListObjectPickerModal;
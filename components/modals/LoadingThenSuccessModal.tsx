import React from "react";
import { ActivityIndicator, Modal, View, Image } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "@/components/typography/SectionText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";
import BodyText from "../typography/BodyText";
import IconWrapper from "../cards/IconWrapper";
import successIcon from "../../assets/icons/successIcon.png";
import { router } from "expo-router";
import PrimaryLoader from "../Loader";

interface LoadingThenSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    loading?: boolean;
    title?: string;
    description?: string;
}

const LoadingThenSuccessModal: React.FC<LoadingThenSuccessModalProps> = ({
    visible,
    onClose,
    title = "Select Time",
    description = "Please wait while we process your request.",
    loading = false,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {
                        loading ? (
                            // <View style={styles.loadingWrapper}>
                            //     <ActivityIndicator size="large" color="#050505" />
                            //     <BodyText textStyle={{ marginTop: 14, textAlign: "center" }} text={description} />
                            // </View>
                            <PrimaryLoader />
                        ) : <>
                            <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                                <Image source={successIcon} resizeMode="contain" />
                            </IconWrapper>
                            <SectionText text={title} />
                            <BodyText textStyle={{ textAlign: 'center' }} text={description} />
                            <View style={{ width: "100%", marginTop: 30 }}>
                                <PrimaryActionButton
                                    textStyle={{ fontFamily: 'secondaryFont', color: '#fff' }}
                                    title="BACK TO HOME SCREEN"
                                    onPress={() => {
                                        onClose();
                                        router.replace("/");
                                    }}
                                    style={styles.button}
                                />
                                <PrimaryActionButton
                                    textStyle={{ fontFamily: 'secondaryFont' }}
                                    title="GO TO BOOKINGS"
                                    onPress={() => {
                                        onClose();
                                        router.replace("/(dashboard)/bookings");
                                    }}
                                    style={[styles.button, { backgroundColor: '#fff' }]}
                                />
                            </View>
                        </>
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
        padding: "18@ms",
        alignItems: "center",
        justifyContent: "center",
        height: "500@ms",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10@ms",
    },

    button: {
        marginTop: "10@ms",
        backgroundColor: "#050505ff",
        width: "100%",
        color: "#fff",
    },

    loadingWrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default LoadingThenSuccessModal;
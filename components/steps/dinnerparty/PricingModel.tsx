import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefIcon2.png";
import receiptIcon from "../../../assets/icons/listIcon.png";
import peopleIcon from "../../../assets/icons/peopleIcon.png";
import plateIcon from "../../../assets/icons/platerIcon.png";
import BodyText from "../../typography/BodyText";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "@/components/Loader";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { convertToThousand } from "@/helpers/utils";

interface PricingModelProps {
    title: string;
    description: string;
    selectedPricingModel: {
        name: string;
        value: string;
        description?: string;
    };
    onPricingModelChange: (nextValue: { name: string; value: string; description?: string }) => void;


    selectedPricingModelTouched?: boolean;
    selectedPricingModelError?: string;
}

export interface IMenuItem {
    id: string;
    name: string;
    description?: string;
    screenshot?: string;
    totalGroceryCost?: number;
    groceries?: {
        groceryName: string;
        description?: string;
        unitPrice?: number;
        id?: string;
    }[];
}

export interface IUploadedMenuImage {
    uri: string;
    name: string;
    type: string;
}

const PricingModel: React.FC<PricingModelProps> = ({
    title,
    description,
    selectedPricingModel,
    onPricingModelChange,
    selectedPricingModelError,
    selectedPricingModelTouched
}) => {
    const menuChoiceOptions = [
        { id: "perhead", name: "Pay Per Head", value: "perhead", description: `Customize a multi-course menu. Price is calculated per guest.`, icon: peopleIcon },
        { id: "plater", name: "Platter-Based", value: "plater", description: `Select pre-arranged platters perfect for sharing among your guests.`, icon: plateIcon }
        
    ];



    const handleSelectionChange = async (deliveryOption: { name: string; value: string; description?: string }) => {
        onPricingModelChange?.(deliveryOption);
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={receiptIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText text={description} />
                {!!(selectedPricingModelTouched && selectedPricingModelError) && (
                    <BodyText text={selectedPricingModelError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                {
                    menuChoiceOptions.map((option) => (
                        <ListCardWithTitleIconAndDescOnly
                            onPress={() => handleSelectionChange(option)}
                            showDescription key={option.value}
                            style={{
                                width: "100%",
                                marginBottom: 10,
                                borderWidth: selectedPricingModel?.value === option.value ? 1.5 : 0,
                                borderColor: selectedPricingModel?.value === option.value ? "#12B76A" : "transparent",
                            }}
                            data={option} />
                    ))
                }
            </FrameCard>
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
    menuHeaderRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    menuRow: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#EAECF0",
        borderTopLeftRadius: "10@ms",
        borderTopRightRadius: "10@ms",
        padding: "10@ms",
        marginTop: "10@ms",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
    },
    menuRowSelected: {
        borderColor: "#12B76A",
        backgroundColor: "#ECFDF3",
    },
    groceryContainer: {
        width: "100%",
        padding: "10@ms",
        backgroundColor: "#fff4ddff",
        borderBottomLeftRadius: "10@ms",
        borderBottomRightRadius: "10@ms",
        borderBottomWidth: 1,
        borderBottomColor: "#a0a1a3ff",
    },
    uploadButton: {
        marginTop: "14@ms",
        width: "100%",
        height: "44@vs",
        borderRadius: "10@ms",
        backgroundColor: "#101828",
        alignItems: "center",
        justifyContent: "center",
    },
    previewImage: {
        marginTop: "12@ms",
        width: "100%",
        height: "180@vs",
        borderRadius: "10@ms",
    },
});

export default PricingModel;
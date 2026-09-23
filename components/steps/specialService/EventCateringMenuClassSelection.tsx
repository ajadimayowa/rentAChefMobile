import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import nigeriaImg from "../../../assets/images/nigeriaMenuPic.png";
import contintlImg from "../../../assets/images/continentalMenuPic.png";
import peopleIcon from "../../../assets/icons/peopleIcon.png";
import platerIcon from "../../../assets/icons/potOfSoupIcon.png";
import BodyText from "../../typography/BodyText";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "@/components/Loader";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { convertToThousand } from "@/helpers/utils";
import ListCardWithTitleIconAndDesc from "@/components/cards/ListCardWithTitleIconAndDesc";
import { Section } from "react-native-paper/lib/typescript/components/Drawer/Drawer";

interface EventCateringMenuClassSelectionProps {
    title: string;
    description: string;
    selectedMenuClass: {
        name: string;
        value: string;
        description?: string;
    };
    onMenuClassChange: (nextValue: { name: string; value: string; description?: string }) => void;

    selectedMenuClassTouched?: boolean;
    selectedMenuClassError?: string;
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

const EventCateringMenuClassSelection: React.FC<EventCateringMenuClassSelectionProps> = ({
    title,
    description,
    selectedMenuClass,
    onMenuClassChange,
    selectedMenuClassTouched,
    selectedMenuClassError
}) => {
    const menuChoiceOptions = [
        { id: "nigerian", name: "Nigerian Menu", value: "150000", description: `Assorted meats, 2 Sides, small chops`, icon: nigeriaImg },
        { id: "continental", name: "Continental Menu", value: "280000", description: `Premium meats, 3 sides, medium chops`, icon: contintlImg },

    ];
    const handleSelectionChange = async (menuClassOption: { name: string; value: string; description?: string }) => {
        onMenuClassChange?.(menuClassOption);
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={platerIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText text={description} />
                {!!(selectedMenuClassTouched && selectedMenuClassError) && (
                    <BodyText text={selectedMenuClassError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>


            {
                    menuChoiceOptions.map((option) => (

                       <Pressable key={option.id} onPress={() => handleSelectionChange(option)}>
                         <FrameCard
                            style={[
                                styles.menuRow,
                                selectedMenuClass?.name === option.name && styles.menuRowSelected,
                            ]}
                        >
                            <Image source={option.icon} resizeMode="contain" style={{ borderRadius: 10, maxWidth: "100%", maxHeight: "100%" }} />
                            <View>
                                <SectionText text={option.name} />
                            </View>
                        </FrameCard>
                       </Pressable>
                    ))
                }
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
        minHeight: "100@vs",
        borderWidth: 1,
        borderColor: "#EAECF0",
        borderTopLeftRadius: "10@ms",
        borderTopRightRadius: "10@ms",
        marginTop: "5@ms",
        backgroundColor: "#ffffffff",
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

export default EventCateringMenuClassSelection;
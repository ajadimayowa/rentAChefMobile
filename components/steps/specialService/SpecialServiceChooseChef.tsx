import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefIcon.png";
import cowSlice from "../../../assets/icons/proteinoptions/streamline-emojis_cow.png";
import halfSlice from "../../../assets/icons/proteinoptions/noto_cut-of-meat.png";
import ramSlice from "../../../assets/icons/proteinoptions/openmoji_ram.png";
import chickenSlice from "../../../assets/icons/proteinoptions/noto_chicken.png";
import fishSlice from "../../../assets/icons/proteinoptions/noto_fish.png";
import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";
import { getServicePricing } from "@/services/servicePricing";
import ListCardWithIconAndValueAtEnd from "@/components/cards/ListCardWithIconAndValueAtEnd";
import { chefCategoryIcons } from "@/constants/Typography";
import { getChefsWithChefCategory } from "@/services/chefService";
import PrimaryLoader from "@/components/Loader";
import ChefCardWithPicAndToggle from "@/components/cards/ChefCardWithPicAndToggle";
import ChefCardWithBioPicAndToggle from "@/components/cards/ChefCardWithBioPicAndToggle";

interface ChooseChefProps {
    description: string;
    serviceId: string;
    chefCategory: {
        id: string;
        chefCatId: string;
        name: string;
        basePriceMinor: number;
    };
    chef: {
        id: string;
        chefCatId: string;
        name: string;
    };
    onChange?: (nextValue: { id: string; name: string; basePriceMinor: number }) => void;
    error?: string;
    touched?: boolean;
}

export interface ProteinOptionItem {
    label: string;
    value: string;
    count: number;
    icon: ImageSourcePropType;
}

const SpecialServiceChooseChef: React.FC<ChooseChefProps> = ({ description, chef, chefCategory, onChange, error, touched }) => {
    // const [localSelection, setLocalSelection] = useState<ProteinOptionItem[]>(DEFAULT_PROTEIN_OPTIONS);
    const [loading, setLoading] = useState<boolean>(true);
    const [chefs, setChefs] = useState<any[]>([]);
    const [openSignatureMenuChefId, setOpenSignatureMenuChefId] = useState<string | null>(null);

    // const selectedValue = Array.isArray(value) && value.length > 0 ? value : localSelection;

    // const syncSelection = useCallback((nextValue: ProteinOptionItem[]) => {
    //     if (onChange) {
    //         onChange(nextValue);
    //         return;
    //     }

    //     setLocalSelection(nextValue);
    // }, [onChange])
    // ;

    const handleSelectionChange = (chef: { id: string; name: string; basePriceMinor: number }) => {
        if (onChange) {
            onChange(chef);
        }

        setOpenSignatureMenuChefId((previousChefId) =>
            previousChefId && previousChefId !== chef.id ? null : previousChefId
        );
    };
    useEffect(() => {
        const fetchChefsFromCategory = async () => {
            // console.log("Fetching chefs for categoryddd:", chefCategory?.chefCatId);
            try {
                setLoading(true);
                const response = await getChefsWithChefCategory(chefCategory?.chefCatId || "", 20, 1); 
                const formatted = response.map((item: any) => ({
                                            ...item,
                                                                                        id: String(item?.id || item?._id || item?.chefId || ""),
                                                                                        chefId: String(item?.chefId || item?.id || item?._id || ""),
                                            icon: item.profilePic,
                                          }));
                setChefs(formatted);
                                setOpenSignatureMenuChefId(null);
                setLoading(false);
            } catch (error) {
                // console.error("Error fetching chef category service pricing:", error);
                setLoading(false);

            }
        }
        fetchChefsFromCategory();
    }, [chefCategory?.chefCatId]);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={chefIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Choose Your Chef" />
                <BodyText text={description} />
                {/* <BodyText text={chefCategory?.id ?? ""} /> */}
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                {
                    loading ? (
                        <PrimaryLoader />
                    ) :
                        <>
                            {chefs.length === 0 && <BodyText text="No chefs available for this category." />}
                            {
  chefs.map((option) => (
    <ChefCardWithBioPicAndToggle
      key={option.id}
      data={option}
      showDescription
      showValue
      showToggle
            selected={chef?.id === option.id}
            isSignatureMenuOpen={openSignatureMenuChefId === option.id}
            onToggleSignatureMenu={() =>
                setOpenSignatureMenuChefId((previousChefId) =>
                    previousChefId === option.id ? null : option.id
                )
            }
      onPress={() => handleSelectionChange(option)}
            style={{
                width: "100%",
            }}
    />
  ))
}
                        </>
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
});

export default SpecialServiceChooseChef;
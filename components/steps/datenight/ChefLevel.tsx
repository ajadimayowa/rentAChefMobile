import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefHat.png";
import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";
import { getServicePricing } from "@/services/servicePricing";
import ListCardWithIconAndValueAtEnd from "@/components/cards/ListCardWithIconAndValueAtEnd";
import { chefCategoryIcons } from "@/constants/Typography";
import PrimaryLoader from "@/components/Loader";

interface ChefLevelProps {
    description: string;
    serviceId: string;
    serviceCatId?: string;
    chefCategory?: {
        id: string;
        chefCatId: string;
        name: string;
        basePriceMinor: number;
    };
    onChange?: (nextValue: { id: string; name: string; basePriceMinor: number }) => void;
    error?: string;
    touched?: boolean;
}

const ChefLevel: React.FC<ChefLevelProps> = ({serviceId, description, chefCategory, onChange, error, touched }) => {
    // const [localSelection, setLocalSelection] = useState<ProteinOptionItem[]>(DEFAULT_PROTEIN_OPTIONS);
    const [loading, setLoading] = useState<boolean>(true);
    const [chefCategoryServicePricing, setChefCategoryServicePricing] = useState<any[]>([]);
    const [selectedChefCat, setSelectedChefCat] = useState<string | undefined>('');

    // const selectedValue = Array.isArray(value) && value.length > 0 ? value : localSelection;

    // const syncSelection = useCallback((nextValue: ProteinOptionItem[]) => {
    //     if (onChange) {
    //         onChange(nextValue);
    //         return;
    //     }

    //     setLocalSelection(nextValue);
    // }, [onChange])
    // ;

    const handleSelectionChange = (cat: { id: string; name: string; basePriceMinor: number }) => {
        if (onChange) {
            onChange(cat);
        }
    };
    useEffect(() => {
            const fetchChefCategoryServicePricing = async () => {
                try {
                    setLoading(true);
                    // Replace with your API endpoint to fetch chef category service pricing based on serviceId
                    const response = await getServicePricing(serviceId); // Assuming the API returns an array of chef category service pricing
                    // console.log("Fetched chef category service pricing:", response);

                    const formatted = response.map((item: any) => ({
                            ...item,
                            basePriceMinor: item.value,
                            icon: chefCategoryIcons[item.name] ?? require("../../../assets/icons/chefCategoryIcons/proChef.png"),
                          }));
                    setChefCategoryServicePricing(formatted); // Assuming the API returns an object with a 'pricing' array
                    setLoading(false);
                } catch (error) {
                    // console.error("Error fetching chef category service pricing:", error);
                    setLoading(false);
    
                }
            }
            fetchChefCategoryServicePricing();
        }, [serviceId]);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={chefIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Select Chef Level" />
                <BodyText text={description} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard style={{ alignItems: "center" }}>
                {
                    loading ? (
                        <PrimaryLoader/>
                    ) : 
                <>
                {chefCategoryServicePricing.length===0 && <BodyText text="No chefs available for this category." />}
                {
                    chefCategoryServicePricing.map((option,index) => {
                    return (
                        <Pressable onPress={() => handleSelectionChange(option)} key={option.id} style={{ marginBottom: 10 }}>
                            <ListCardWithIconAndValueAtEnd
                                data={option}
                                showDescription={true}
                                showValue={true}
                                style={{ backgroundColor: chefCategory?.chefCatId === option.chefCatId ? "#ECFDF3" : "#F5F5F5" }}
                            />
                        </Pressable>
                    );
                }
                )
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

export default ChefLevel;
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import plateIcon from "../../../assets/icons/potOfSoupIcon.png";
import BodyText from "../../typography/BodyText";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "@/components/Loader";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { convertToThousand } from "@/helpers/utils";
import { getPackages } from "@/services/packages";
import { packageIcons } from "@/constants/Typography";

interface ChoosePkgProps {
    title: string;
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
    selectedPackage?: {
        id?: string;
        name: string;
        value: string;
        description?: string;
    };
    selectedMenus?: IMenuItem[];
    uploadedMenuImageUri?: string;
    onPackageSelectionChange?: (nextValue: { id?: string; name: string; value: string; description?: string }) => void;
    onSelectedMenusChange?: (nextValue: IMenuItem[]) => void;
    onUploadedMenuImageChange?: (nextValue: IUploadedMenuImage | null) => void;
    selectedPackageError?: string;
    selectedPackageTouched?: boolean;
    selectedMenusTouched?: boolean;
    selectedMenusError?: string;
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

const ChoosePkg: React.FC<ChoosePkgProps> = ({
    title,
    description,
    selectedPackage,
    onPackageSelectionChange,
    selectedPackageError,
    selectedPackageTouched
}) => {
    const [loadingPckgs, setLoadingPckgs] = useState<boolean>(false);
    const [pckgs, setPckgs] = useState<any[]>([]);


    useEffect(() => {
        const fetchPckgs = async () => {
            try {
                setLoadingPckgs(true);
                // Replace with your API endpoint to fetch chef category service pricing based on serviceId
                const response = await getPackages(); // Assuming the API returns an array of chef category service pricing
                // console.log("Fetched chef category service pricing:", response);

                const formatted = response.map((item: any) => ({
                    ...item,
                    icon: packageIcons[item.name] ?? require("../../../assets/icons/pckgIcons/fancyWineicon.png"),
                }));
                setPckgs(formatted); // Assuming the API returns an object with a 'pricing' array
                setLoadingPckgs(false);
            } catch (error) {
                // console.error("Error fetching chef category service pricing:", error);
                setLoadingPckgs(false);

            }
        }
        fetchPckgs();
    }, []);


    

    const handleSelectionChange = async (deliveryOption: { id: string; name: string; value: string; description?: string }) => {
        console.log("Selected delivery option:", deliveryOption);
        onPackageSelectionChange?.(deliveryOption);
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={plateIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText text={description} textStyle={{ textAlign: 'center' }} />
                {!!(selectedPackageTouched && selectedPackageError) && (
                    <BodyText text={selectedPackageError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <SectionText text="Packages" textStyle={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 10 }} />
            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                {
                    pckgs.map((option) => (
                        <ListCardWithTitleIconAndDescOnly
                            onPress={() => handleSelectionChange(option)}
                            showDescription key={option.value}
                            style={{
                                width: "100%",
                                marginBottom: 10,
                                borderWidth: selectedPackage?.value === option.value ? 1.5 : 0,
                                borderColor: selectedPackage?.value === option.value ? "#12B76A" : "transparent",
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

export default ChoosePkg;
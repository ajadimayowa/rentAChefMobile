import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import plateIcon from "../../../assets/icons/platerIcon.png";
import BodyText from "../../typography/BodyText";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import ListCardWithTitleIconAndDesc from "@/components/cards/ListCardWithTitleIconAndDesc";
import CollapsableSelections, { CollapsableSelectionMenu, CollapsableSelectionType } from "@/components/CollapsableSelections";

interface PlaterSizeSelectionProps {
    title: string;
    description: string;
    selectedPlaterSize: {
        id: string;
        name: string;
        value: string;
        description?: string;
    };
    selectedCookLocation: {
        name: string;
        value: string;
        description?: string;
    };
    onPlaterSizeChange: (
        nextValue: { id: string; name: string; value: string; description?: string },
        selectedMenu?: IMenuItem
    ) => void;
    onCookLocationChange?: (nextValue: { name: string; value: string; description?: string }) => void;

    selectedPlaterSizeTouched?: boolean;
    selectedPlaterSizeError?: string;

    selectedCookLocationError?: string;
    selectedCookLocationTouched?: boolean;
}

export interface IMenuItem {
    id: string;
    name: string;
    description?: string;
    screenshot?: string;
    pricePerHead?: number;
    totalGroceryCost?: number;
    unitTotalGroceryCost?: number;
    noOfPeople?: number;
    value?: string;
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

const PlaterSizeSelection: React.FC<PlaterSizeSelectionProps> = ({
    title,
    description,
    selectedPlaterSize,
    selectedCookLocation,
    onPlaterSizeChange,
    onCookLocationChange,
    selectedPlaterSizeError,
    selectedPlaterSizeTouched,
    selectedCookLocationError,
    selectedCookLocationTouched
}) => {
    const [loadingMenus, setLoadingMenus] = useState<boolean>(false);
    const [menuChoiceOptions, setMenuChoiceOptions] = useState<IMenuItem[]>([]);
    const [selectedPlaterMenus, setSelectedPlaterMenus] = useState<CollapsableSelectionMenu[]>([]);

    const cookLocation = [
        { id: "yourkitchen", name: "Your Kitchen", value: "150000", description: `Chef cooks at your provided address`},
        { id: "ouroffice", name: "Our Office Kitchen", value: "280000", description: `Meals are prepared at our facility and delivered to your location` },
        
    ];



    const fetchPlaterMenus = useCallback(async () => {
        try {
            setLoadingMenus(true);
            const response = await getMenus({
                pricingModel: "plater",
                limit: 30,
                page: 1,
            });

            const fetchedMenus = Array.isArray(response?.data?.data) ? response.data.data : [];
            const normalizedMenus: IMenuItem[] = fetchedMenus.map((menu: any) => ({
                id: String(menu?.id || menu?._id || ""),
                name: String(menu?.title || menu?.name || "Untitled menu"),
                description: menu?.description,
                screenshot: menu?.samplePicture || menu?.screenshot,
                pricePerHead: Number(menu?.pricePerHead || 0),
                totalGroceryCost: Number(menu?.totalGroceryCost || 0),
                unitTotalGroceryCost: Number(menu?.pricePerHead || menu?.unitTotalGroceryCost || menu?.totalGroceryCost || 0),
                value: String(menu?.totalGroceryCost || 0),
                groceries: Array.isArray(menu?.groceries)
                    ? menu.groceries.map((grocery: any) => ({
                        groceryName: String(grocery?.groceryName || ""),
                        description: grocery?.description,
                        unitPrice: Number(grocery?.unitPrice || 0),
                        id: String(grocery?.id || grocery?._id || ""),
                    }))
                    : [],
            }));

            setMenuChoiceOptions(normalizedMenus);
        } catch {
            setMenuChoiceOptions([]);
        } finally {
            setLoadingMenus(false);
        }
    }, []);

    useEffect(() => {
        fetchPlaterMenus();
    }, [fetchPlaterMenus]);

    useEffect(() => {
        if (!selectedPlaterSize?.id) {
            setSelectedPlaterMenus([]);
            return;
        }

        const matchedMenu = menuChoiceOptions.find((menu) => menu.id === selectedPlaterSize.id);
        if (!matchedMenu) {
            return;
        }

        const totalCost = Number(selectedPlaterSize.value || matchedMenu.totalGroceryCost || 0);
        const unitCost = Number(matchedMenu.unitTotalGroceryCost || matchedMenu.totalGroceryCost || 0);
        const heads = unitCost > 0 ? Math.max(1, Math.round(totalCost / unitCost)) : 1;

        setSelectedPlaterMenus([
            {
                id: matchedMenu.id,
                name: matchedMenu.name,
                description: matchedMenu.description,
                noOfPeople: heads,
                unitTotalGroceryCost: unitCost,
                totalGroceryCost: totalCost,
            },
        ]);
    }, [menuChoiceOptions, selectedPlaterSize?.id, selectedPlaterSize?.value]);

    const menuTypes = useMemo<CollapsableSelectionType[]>(() => {
        return [
            {
                id: "plater-options",
                name: "Select Platter Menu",
                description: "",
                menus: menuChoiceOptions.map((menu) => ({
                    id: menu.id,
                    name: menu.name,
                    description: menu.description,
                    noOfPeople: menu.noOfPeople,
                    unitTotalGroceryCost: Number(menu.unitTotalGroceryCost || menu.pricePerHead || menu.totalGroceryCost || 0),
                    totalGroceryCost: Number(menu.totalGroceryCost || 0),
                })),
            },
        ];
    }, [menuChoiceOptions]);

    const handlePlaterMenusChange = (nextMenus: CollapsableSelectionMenu[]) => {
        if (!nextMenus.length) {
            setSelectedPlaterMenus([]);
            onPlaterSizeChange?.({ id: "", name: "", value: "", description: "" }, undefined);
            return;
        }

        const activeSelection = nextMenus[nextMenus.length - 1];
        const singleSelection = [activeSelection];
        setSelectedPlaterMenus(singleSelection);

        const matchedMenu = menuChoiceOptions.find((menu) => menu.id === activeSelection.id);
        const selectedTotal = Number(activeSelection.totalGroceryCost || 0);
        const selectedUnit = Number(activeSelection.unitTotalGroceryCost || matchedMenu?.unitTotalGroceryCost || matchedMenu?.pricePerHead || matchedMenu?.totalGroceryCost || 0);
        const selectedHeads = Number(activeSelection.noOfPeople || 1);

        const normalizedSelectedMenu: IMenuItem = {
            id: activeSelection.id,
            name: activeSelection.name,
            description: activeSelection.description,
            screenshot: matchedMenu?.screenshot,
            groceries: matchedMenu?.groceries,
            noOfPeople: selectedHeads,
            unitTotalGroceryCost: selectedUnit,
            totalGroceryCost: selectedTotal,
            value: String(selectedTotal),
        };

        onPlaterSizeChange?.(
            {
                id: activeSelection.id,
                name: activeSelection.name,
                value: String(selectedTotal),
                description: activeSelection.description,
            },
            normalizedSelectedMenu
        );
    };

    const handleCookLocationChange = async (cookLocationOption: { name: string; value: string; description?: string }) => {
        onCookLocationChange?.(cookLocationOption);
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={plateIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText text={description} />
                {!!(selectedPlaterSizeTouched && selectedPlaterSizeError) && (
                    <BodyText text={selectedPlaterSizeError} textStyle={{ color: "#B42318" }} />
                )}
                {!!(selectedCookLocationTouched && selectedCookLocationError) && (
                    <BodyText text={selectedCookLocationError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>


            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                {loadingMenus ? (
                    <PrimaryLoader />
                ) : menuChoiceOptions.length === 0 ? (
                    <BodyText text="No platter menus found right now." textStyle={{ marginTop: 10 }} />
                ) : (
                    <CollapsableSelections
                    showCounter={false}
                        menuTypes={menuTypes}
                        selectedMenus={selectedPlaterMenus}
                        onSelectedMenusChange={handlePlaterMenusChange}
                        unitLabel="plater"
                        emptyText="No platter menus found for this selection."
                    />
                )}
            </FrameCard>

            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                <View style={{ width: '100%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <SectionText text="Select Cook Location" textStyle={{ marginTop: 10, marginBottom: 10, fontSize: 16, fontWeight: 'bold' }} />
                </View>
                {
                    cookLocation.map((option) => (
                        <ListCardWithTitleIconAndDesc
                            onPress={() => handleCookLocationChange(option)}
                            showDescription key={option.value}
                            showValue={false}
                            style={{
                                width: "100%",
                                marginBottom: 10,
                                borderWidth: selectedCookLocation?.value === option.value ? 1.5 : 0,
                                borderColor: selectedCookLocation?.value === option.value ? "#e2700cff" : "transparent",
                            }}
                            data={option} />
                    ))
                }

                {
                    selectedCookLocation?.name === "Our Office Kitchen" &&
                    <View style={{ marginTop: 10, backgroundColor: '#FFFBED', width: "100%", padding: 10, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 5, flexDirection: 'row', gap: 10 }}>
                        <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
                        <View style={{ flex: 1, backgroundColor: 'transparent', maxWidth: "90%" }}>
                            <BodyText text={`A 15% service fee is applied when meals are prepared in our office kitchen.`} />
                        </View>
                    </View>}
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

export default PlaterSizeSelection;
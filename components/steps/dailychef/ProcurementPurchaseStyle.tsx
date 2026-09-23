import React, { useEffect, useMemo, useRef } from "react";
import { Image } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefIcon2.png";
import receiptIcon from "../../../assets/icons/listIcon.png";
import cartIcon from "../../../assets/icons/cartIcon.png"
import BodyText from "../../typography/BodyText";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { Ionicons } from "@expo/vector-icons";
import { convertToThousand } from "@/helpers/utils";

interface ProcurementPurchaseStyleProps {
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
    menuDeliveryOption?: {
        name: string;
        value: string;
        description?: string;
    };
    selectedMenus?: IMenuItem[];
    uploadedMenuImageUri?: string;
    procurementPurchaseOption: {
        name: string;
        value: string;
        description?: string;
    };
    onProcurementPurchaseOptionChange?: (nextValue: { name: string; value: string; description?: string }) => void;
    onCombinedGroceriesChange?: (nextValue: ICombinedGroceryItem[]) => void;
    procurementOptionError?: string;
    procurementOptionTouched?: boolean;
    selectedMenusError?: string;
    selectedMenusTouched?: boolean;
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

export interface ICombinedGroceryItem {
    groceryName: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

const ProcurementPurchaseStyle: React.FC<ProcurementPurchaseStyleProps> = ({
    procurementPurchaseOption,
    selectedMenus = [],
    onProcurementPurchaseOptionChange,
    onCombinedGroceriesChange,
    procurementOptionError,
    procurementOptionTouched,
}) => {
    const combinedGroceriesChangeRef = useRef(onCombinedGroceriesChange);

    useEffect(() => {
        combinedGroceriesChangeRef.current = onCombinedGroceriesChange;
    }, [onCombinedGroceriesChange]);

    const procurementPurchaseOptions = [
        {id: "organization", name: "Company Procures", value: "organization", description: `We handle all the shopping for you`, icon: chefIcon },
        {id: "self", name: "I'll procure ingredients myself", value: "self", description: "You provide all necessary items", icon: receiptIcon }
    ];

    const combinedGroceries = useMemo<ICombinedGroceryItem[]>(() => {
        const groceryMap = new Map<string, ICombinedGroceryItem>();

        selectedMenus.forEach((menu) => {
            (menu.groceries || []).forEach((grocery) => {
                const groceryName = String(grocery?.groceryName || "").trim();
                if (!groceryName) {
                    return;
                }

                const description = grocery?.description?.trim() || undefined;
                const unitPrice = Number(grocery?.unitPrice || 0);
                const key = `${groceryName.toLowerCase()}-${description || ""}-${unitPrice}`;
                const existing = groceryMap.get(key);

                if (existing) {
                    const nextQuantity = existing.quantity + 1;
                    groceryMap.set(key, {
                        ...existing,
                        quantity: nextQuantity,
                        totalPrice: nextQuantity * unitPrice,
                    });
                    return;
                }

                groceryMap.set(key, {
                    groceryName,
                    description,
                    unitPrice,
                    quantity: 1,
                    totalPrice: unitPrice,
                });
            });
        });

        return Array.from(groceryMap.values());
    }, [selectedMenus]);

    const combinedGroceriesTotalPrice = useMemo(() => {
        return combinedGroceries.reduce((sum, grocery) => sum + Number(grocery.totalPrice || 0), 0);
    }, [combinedGroceries]);

    const handleSelectionChange = async (nextOption: { name: string; value: string; description?: string }) => {
        onProcurementPurchaseOptionChange?.(nextOption);
        combinedGroceriesChangeRef.current?.(nextOption.value === "organization" ? combinedGroceries : []);
    };

    useEffect(() => {
        if (procurementPurchaseOption?.value === "organization") {
            combinedGroceriesChangeRef.current?.(combinedGroceries);
            return;
        }

        if (procurementPurchaseOption?.value === "self") {
            combinedGroceriesChangeRef.current?.([]);
        }
    }, [combinedGroceries, procurementPurchaseOption?.value]);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cartIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Ingredient Procurement" />
                <BodyText text={`How would you like to handle groceries?`} />
                {!!(procurementOptionTouched && procurementOptionError) && (
                    <BodyText text={procurementOptionError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard style={{ alignItems: "center", width: '100%' }}>
                {
                    procurementPurchaseOptions.map((option) => (
                        <ListCardWithTitleIconAndDescOnly
                            onPress={() => handleSelectionChange(option)}
                            showDescription key={option.value}
                            style={{
                                width: "100%",
                                marginBottom: 10,
                                borderWidth: procurementPurchaseOption?.value === option.value ? 1.5 : 0,
                                borderColor: procurementPurchaseOption?.value === option.value ? "#12B76A" : "transparent",
                            }}
                            data={option} />
                    ))
                }
            </FrameCard>

            {procurementPurchaseOption?.value === "organization" && (
                <FrameCard style={{ width: "100%" }}>
                    <View style={styles.menuHeaderRow}>
                        <SectionText text="Combined Grocery List" />
                        <SectionText text={convertToThousand(combinedGroceriesTotalPrice)} textStyle={{ color: "#12B76A" }} />
                    </View>

                    {combinedGroceries.length > 0 ? (
                        <View style={[styles.groceryContainer, { marginTop: 10 }]}> 
                            {combinedGroceries.map((grocery, index) => (
                                <BodyText
                                    key={`${grocery.groceryName}-${index}`}
                                    text={`• ${grocery.groceryName}${grocery.description ? ` (${grocery.description})` : ""} x${grocery.quantity} - ${convertToThousand(grocery.totalPrice || 0)}`}
                                    textStyle={{ marginBottom: 3 }}
                                />
                            ))}
                        </View>
                    ) : (
                        <BodyText text="Select menu items first to generate groceries." textStyle={{ marginTop: 8 }} />
                    )}
                </FrameCard>
            )}

            {procurementPurchaseOption?.value === "self" && (
                <FrameCard style={{ width: "100%" }}>
                    <View style={styles.warningBadge}>
                        <Ionicons name="warning-outline" size={20} color="#B54708" />
                        <View style={{ flex: 1, backgroundColor: "transparent" }}>
                            <BodyText text="All ingredients must be ready before the chef arrives." textStyle={{ color: "#B54708" }} />
                        </View>
                    </View>
                </FrameCard>
            )}
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
    warningBadge: {
        width: "100%",
        padding: "10@ms",
        borderWidth: 1,
        borderColor: "#FEC84B",
        backgroundColor: "#FFFAEB",
        borderRadius: "8@ms",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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

export default ProcurementPurchaseStyle;
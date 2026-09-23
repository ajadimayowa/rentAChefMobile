import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefIcon2.png";
import receiptIcon from "../../../assets/icons/listIcon.png";
import uploadIcon from "../../../assets/icons/uploadIcon.png";
import plateIcon from "../../../assets/icons/potOfSoupIcon.png";
import BodyText from "../../typography/BodyText";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "@/components/Loader";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { convertToThousand } from "@/helpers/utils";

interface ChooseMenuSelectionOptionProps {
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
    menuDeliveryOption?: {
        name: string;
        value: string;
        description?: string;
    };
    selectedMenus?: IMenuItem[];
    uploadedMenuImageUri?: string;
    onMenuDeliveryOptionChange?: (nextValue: { name: string; value: string; description?: string }) => void;
    onSelectedMenusChange?: (nextValue: IMenuItem[]) => void;
    onUploadedMenuImageChange?: (nextValue: IUploadedMenuImage | null) => void;
    menuDeliveryOptionError?: string;
    menuDeliveryOptionTouched?: boolean;
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

const ChooseMenuSelectionOption: React.FC<ChooseMenuSelectionOptionProps> = ({
    description,
    chef,
    menuDeliveryOption,
    selectedMenus = [],
    uploadedMenuImageUri,
    onMenuDeliveryOptionChange,
    onSelectedMenusChange,
    onUploadedMenuImageChange,
    menuDeliveryOptionError,
    menuDeliveryOptionTouched,
    selectedMenusError,
    selectedMenusTouched,
}) => {
    const [loadingMenus, setLoadingMenus] = useState<boolean>(false);
    const [menus, setMenus] = useState<IMenuItem[]>([]);

    const menuChoiceOptions = [
        { id: "chef", name: "Chef's Menu", value: "chef", description: `Signature dishes from ${chef?.name || "the chef"}`, icon: chefIcon },
        { id: "organization", name: "Rent A Chef Standard Menu", value: "organization", description: "Our curated meal selection", icon: receiptIcon },
        { id: "upload", name: "Upload Your Own Menu", value: "upload", description: "Provide your own custom meal plan", icon: uploadIcon },
    ];

    const selectedMenuIds = useMemo(() => new Set(selectedMenus.map((item) => item.id)), [selectedMenus]);
    const selectedMenusTotalPrice = useMemo(() => {
        return selectedMenus.reduce((sum, menu) => sum + Number(menu?.totalGroceryCost || 0), 0);
    }, [selectedMenus]);

    const fetchMenuByCreatorType = useCallback(async (menuCreatorType: "chef" | "organization") => {
        try {
            setLoadingMenus(true);
            const response = await getMenus({
                menuCreatorType,
                chefId: menuCreatorType === "chef" ? String(chef?.id || "") : undefined,
                limit: 30,
                page: 1,
            });
            const fetchedMenus = (response?.data?.data || []).map((item: any) => ({
                id: String(item?.id || item?._id || ""),
                name: String(item?.title || item?.name || "Untitled menu"),
                description: item?.description,
                screenshot: item?.screenshot,
                totalGroceryCost: Number(item?.totalGroceryCost || 0),
                groceries: Array.isArray(item?.groceries)
                    ? item.groceries.map((grocery: any) => ({
                          groceryName: String(grocery?.groceryName || ""),
                          description: grocery?.description,
                          unitPrice: Number(grocery?.unitPrice || 0),
                          id: String(grocery?.id || grocery?._id || ""),
                      }))
                    : [],
            }));
            setMenus(fetchedMenus.filter((item: IMenuItem) => item.id));
        } catch (error) {
            setMenus([]);
        } finally {
            setLoadingMenus(false);
        }
    }, [chef?.id]);

    const handleSelectionChange = async (deliveryOption: { name: string; value: string; description?: string }) => {
        onMenuDeliveryOptionChange?.(deliveryOption);

        if (menuDeliveryOption?.value !== deliveryOption.value) {
            setMenus([]);
        }

        if (deliveryOption.value === "chef") {
            await fetchMenuByCreatorType("chef");
            return;
        }

        if (deliveryOption.value === "organization") {
            await fetchMenuByCreatorType("organization");
        }
    };

    useEffect(() => {
        if (menus.length > 0) {
            return;
        }

        if (menuDeliveryOption?.value === "chef") {
            fetchMenuByCreatorType("chef");
            return;
        }

        if (menuDeliveryOption?.value === "organization") {
            fetchMenuByCreatorType("organization");
        }
    }, [menuDeliveryOption?.value, menus.length, fetchMenuByCreatorType]);

    const handleToggleMenu = (menu: IMenuItem) => {
        const alreadySelected = selectedMenuIds.has(menu.id);

        if (alreadySelected) {
            onSelectedMenusChange?.(selectedMenus.filter((item) => item.id !== menu.id));
            return;
        }

        onSelectedMenusChange?.([...selectedMenus, menu]);
    };

    const handlePickImage = async () => {
        const permissionResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResponse.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const image = result.assets[0];
        onUploadedMenuImageChange?.({
            uri: image.uri,
            name: image.fileName || `menu-${Date.now()}.jpg`,
            type: image.mimeType || "image/jpeg",
        });
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={plateIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Menu Details" />
                <BodyText text={description} />
                {!!(menuDeliveryOptionTouched && menuDeliveryOptionError) && (
                    <BodyText text={menuDeliveryOptionError} textStyle={{ color: "#B42318" }} />
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
                            borderWidth: menuDeliveryOption?.value === option.value ? 1.5 : 0,
                            borderColor: menuDeliveryOption?.value === option.value ? "#12B76A" : "transparent",
                        }}
                        data={option} />
                    ))
               }
            </FrameCard>

            {(menuDeliveryOption?.value === "chef" || menuDeliveryOption?.value === "organization") && (
                <FrameCard style={{ width: "100%" }}>
                    <View style={styles.menuHeaderRow}>
                        <SectionText text="Choose Menus" />
                        <SectionText text={convertToThousand(selectedMenusTotalPrice)} textStyle={{ color: "#12B76A" }} />
                    </View>
                    {!!(selectedMenusTouched && selectedMenusError) && (
                        <BodyText text={selectedMenusError} textStyle={{ color: "#B42318", marginTop: 8 }} />
                    )}

                    {loadingMenus ? (
                        <PrimaryLoader />
                    ) : menus.length === 0 ? (
                        <BodyText text="No menus found for this selection." textStyle={{ marginTop: 10 }} />
                    ) : (
                        menus.map((menu) => {
                            const selected = selectedMenuIds.has(menu.id);
                            const menuGroceries = menu.groceries || [];

                            return (
                                <React.Fragment key={menu.id}>
                                <Pressable
                                    onPress={() => handleToggleMenu(menu)}
                                    style={[styles.menuRow, selected && styles.menuRowSelected]}
                                >
                                    <View style={{ flex: 1, backgroundColor: "transparent" }}>
                                        <SectionText text={menu.name} />
                                        {!!menu.description && <BodyText text={menu.description} textStyle={{ marginTop: 4 }} />}
                                    </View>
                                    <View style={{ alignItems: "flex-end", backgroundColor: "transparent", marginLeft: 10 }}>
                                        <BodyText text={convertToThousand(menu.totalGroceryCost || 0)} textStyle={{ fontWeight: "600", marginBottom: 4 }} />
                                        <Ionicons
                                            name={selected ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={selected ? "#12B76A" : "#98A2B3"}
                                        />
                                    </View>
                                </Pressable>
                                <View style={{marginBottom: 10 }} >
                                    {menuGroceries.length > 0 && (
                                        <View style={styles.groceryContainer}>
                                            <SectionText text="Groceries" textStyle={{ fontSize: 14, fontWeight: "600", marginBottom: 4 }} />
                                            {menuGroceries.map((grocery, index) => {
                                                const groceryName = grocery?.groceryName || "Unnamed item";
                                                const groceryPrice = convertToThousand(grocery?.unitPrice || 0);
                                                const groceryDescription = grocery?.description ? ` (${grocery.description})` : "";
                                                return (
                                                    <BodyText
                                                        key={grocery?.id || `${menu.id}-grocery-${index}`}
                                                        text={`• ${groceryName}${groceryDescription} - ${groceryPrice}`}
                                                        textStyle={{ fontSize: 14, marginBottom: 2 }}
                                                    />
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                                </React.Fragment>
                            );
                        })
                    )}
                </FrameCard>
            )}

            {menuDeliveryOption?.value === "upload" && (
                <FrameCard style={{ width: "100%" }}>
                    <SectionText text="Upload Your Menu" />
                    <BodyText text="Pick a picture containing your menu." textStyle={{ marginTop: 4 }} />
                    <Pressable onPress={handlePickImage} style={styles.uploadButton}>
                        <BodyText text="Select Picture" textStyle={{ color: "#fff" }} />
                    </Pressable>
                    {!!uploadedMenuImageUri && (
                        <Image source={{ uri: uploadedMenuImageUri }} style={styles.previewImage} resizeMode="cover" />
                    )}
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

export default ChooseMenuSelectionOption;
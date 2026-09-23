import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getMenus } from "@/services/menuService";
import PrimaryLoader from "../Loader";
import BodyText from "../typography/BodyText";
import Colors from "@/constants/Colors";

export interface IChefMenu {
    chefId: string;
}

interface IMenuCategory {
    id: string;
    title: string;
}

interface IMenuItem {
    id: string;
    title: string;
    description?: string;
    menuType?: "breakfast" | "lunch" | "dinner";
    menuClass?: "nigerian" | "continental";
    pricingModel?: "perhead" | "plater";
    pricePerHead?: number;
    isSignatureMenu?: boolean;
    samplePicture?: string | null;
    menuCategory?: IMenuCategory[];
    totalGroceryCost?: number;
}

const ChefMenuTab: React.FC<IChefMenu> = ({ chefId }) => {
    const [chefMenus, setChefMenus] = useState<IMenuItem[]>([]);
    const [loading, setLoading] = useState(false);

    const formatPrice = (value?: number) => {
        if (!value) return "N0";
        return `N${value.toLocaleString()}`;
    };

    const formatMenuType = (menuType?: string) => {
        if (!menuType) return "General";
        return menuType.charAt(0).toUpperCase() + menuType.slice(1);
    };

    const formatPricingModel = (pricingModel?: string) => {
        if (!pricingModel) return "Flat";
        return pricingModel === "perhead" ? "Per Head" : "Platter";
    };

    const fetchChefMenu = async () => {
        if (!chefId) return;

        setLoading(true);
        try {
            const res = await getMenus(chefId);
            if (res?.data?.success) {
                setChefMenus(res?.data?.data || res?.data?.payload || []);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Network error",
                    text2: res?.data?.message || "Something went wrong!",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Network error",
                text2: "Something went wrong!",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChefMenu();
    }, [chefId]);

    if (loading && chefMenus.length === 0) {
        return <PrimaryLoader />;
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchChefMenu} />
            }
            contentContainerStyle={styles.contentContainer}
            style={styles.container}
        >
            {chefMenus.length > 0 ? (
                chefMenus.map((menu) => (
                    <View key={menu.id} style={styles.card}>
                        {menu.samplePicture ? (
                            <Image source={{ uri: menu.samplePicture }} style={styles.image} />
                        ) : (
                            <View style={styles.imageFallback}>
                                <Text style={styles.imageFallbackText}>{formatMenuType(menu.menuType)}</Text>
                            </View>
                        )}

                        <View style={styles.cardContent}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.title}>{menu.title}</Text>
                                {menu.isSignatureMenu ? (
                                    <View style={styles.signatureTag}>
                                        <Text style={styles.signatureTagText}>Signature</Text>
                                    </View>
                                ) : null}
                            </View>

                            <Text style={styles.description} numberOfLines={2}>
                                {menu.description || "No description added yet."}
                            </Text>

                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{formatMenuType(menu.menuType)}</Text>
                                </View>
                                {menu.menuClass ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{menu.menuClass}</Text>
                                    </View>
                                ) : null}
                                {menu.pricingModel ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{formatPricingModel(menu.pricingModel)}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {menu.menuCategory && menu.menuCategory.length > 0 ? (
                                <Text style={styles.categoryText}>
                                    Category: {menu.menuCategory.map((item) => item.title).join(", ")}
                                </Text>
                            ) : null}

                            <View style={styles.rowBetween}>
                                <Text style={styles.price}>{formatPrice(menu.pricePerHead)}</Text>
                                <Text style={styles.groceryCost}>
                                    Grocery: {formatPrice(menu.totalGroceryCost)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyStateContainer}>
                    <BodyText text="No uploaded menu at this time." />
                </View>
            )}
        </ScrollView>
    );
};



const styles = ScaledSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    contentContainer: {
        paddingBottom: "20@vs",
    },
    card: {
        width: "100%",
        marginTop: "10@vs",
        backgroundColor: "#fff",
        borderRadius: "14@s",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "140@vs",
    },
    imageFallback: {
        width: "100%",
        height: "100@vs",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary.light,
    },
    imageFallbackText: {
        color: Colors.primary.base,
        fontSize: "13@ms",
        fontWeight: "700",
    },
    cardContent: {
        padding: "12@s",
        gap: "7@vs",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8@s",
    },
    title: {
        flex: 1,
        color: "#1f2937",
        fontSize: "15@ms",
        fontWeight: "700",
    },
    signatureTag: {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        borderWidth: 1,
        paddingVertical: "2@vs",
        paddingHorizontal: "8@s",
        borderRadius: "20@s",
    },
    signatureTagText: {
        color: "#92400e",
        fontSize: "10@ms",
        fontWeight: "700",
    },
    description: {
        color: "#4b5563",
        fontSize: "12@ms",
        lineHeight: "18@vs",
    },
    badgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "8@s",
    },
    badge: {
        backgroundColor: "#f3f4f6",
        paddingVertical: "4@vs",
        paddingHorizontal: "8@s",
        borderRadius: "14@s",
    },
    badgeText: {
        color: "#111827",
        fontSize: "11@ms",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    categoryText: {
        color: "#6b7280",
        fontSize: "11@ms",
        textTransform: "capitalize",
    },
    price: {
        color: Colors.primary.base,
        fontWeight: "800",
        fontSize: "16@ms",
    },
    groceryCost: {
        color: "#374151",
        fontWeight: "600",
        fontSize: "11@ms",
    },
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: "24@vs",
    },
});
export default ChefMenuTab;
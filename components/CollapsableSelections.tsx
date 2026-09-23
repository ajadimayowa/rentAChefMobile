import React, { useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { View } from "./Themed";
import SectionText from "./typography/SectionText";
import BodyText from "./typography/BodyText";
import { convertToThousand } from "@/helpers/utils";

export interface CollapsableSelectionMenu {
    id: string;
    name: string;
    description?: string;
    totalGroceryCost?: number;
    unitTotalGroceryCost?: number;
    noOfPeople?: number;
    menuTypeId?: string;
    menuTypeName?: string;
}

export interface CollapsableSelectionType {
    id: string;
    name: string;
    description?: string;
    menus?: CollapsableSelectionMenu[];
}

interface CollapsableSelectionsProps {
    menuTypes: CollapsableSelectionType[];
    selectedMenus?: CollapsableSelectionMenu[];
    showCounter?: boolean;
    onSelectedMenusChange?: (nextValue: CollapsableSelectionMenu[]) => void;
    emptyText?: string;
    unitLabel?: string;
}

const getUnitPrice = (menu: CollapsableSelectionMenu) => Number(menu?.unitTotalGroceryCost ?? menu?.totalGroceryCost ?? 0);

const normalizeSelectedMenu = (
    menu: CollapsableSelectionMenu,
    menuType: CollapsableSelectionType,
    heads: number,
): CollapsableSelectionMenu => {
    const unitTotalGroceryCost = getUnitPrice(menu);

    return {
        ...menu,
        menuTypeId: menuType.id,
        menuTypeName: menuType.name,
        noOfPeople: heads,
        unitTotalGroceryCost,
        totalGroceryCost: unitTotalGroceryCost * heads,
    };
};

const CollapsableSelections: React.FC<CollapsableSelectionsProps> = ({
    menuTypes,
    selectedMenus = [],
    onSelectedMenusChange,
    showCounter = true,
    emptyText = "No menus found for this section.",
    unitLabel = "head",
}) => {
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!menuTypes.length) {
            setExpandedMap({});
            return;
        }

        setExpandedMap((previous) => {
            const hasAnyExpanded = menuTypes.some((type) => previous[type.id]);
            if (hasAnyExpanded) {
                return previous;
            }

            return {
                ...previous,
                [menuTypes[0].id]: true,
            };
        });
    }, [menuTypes]);

    const selectedMenusMap = useMemo(() => {
        const map = new Map<string, CollapsableSelectionMenu>();
        selectedMenus.forEach((menu) => {
            if (menu?.id) {
                map.set(menu.id, menu);
            }
        });
        return map;
    }, [selectedMenus]);

    const toggleSection = (menuTypeId: string) => {
        setExpandedMap((previous) => ({
            ...previous,
            [menuTypeId]: !previous[menuTypeId],
        }));
    };

    const handleToggleMenu = (menu: CollapsableSelectionMenu, menuType: CollapsableSelectionType) => {
        const selectedMenu = selectedMenusMap.get(menu.id);

        if (selectedMenu) {
            onSelectedMenusChange?.(selectedMenus.filter((item) => item.id !== menu.id));
            return;
        }

        onSelectedMenusChange?.([
            ...selectedMenus,
            normalizeSelectedMenu(menu, menuType, 1),
        ]);
    };

    const handleIncrement = (menu: CollapsableSelectionMenu, menuType: CollapsableSelectionType) => {
        const selectedMenu = selectedMenusMap.get(menu.id);

        if (!selectedMenu) {
            onSelectedMenusChange?.([
                ...selectedMenus,
                normalizeSelectedMenu(menu, menuType, 1),
            ]);
            return;
        }

        const nextHeads = Number(selectedMenu.noOfPeople || 0) + 1;
        const updated = normalizeSelectedMenu(selectedMenu, menuType, nextHeads);

        onSelectedMenusChange?.(
            selectedMenus.map((item) => (item.id === menu.id ? updated : item)),
        );
    };

    const handleDecrement = (menu: CollapsableSelectionMenu, menuType: CollapsableSelectionType) => {
        const selectedMenu = selectedMenusMap.get(menu.id);

        if (!selectedMenu) {
            return;
        }

        const currentHeads = Number(selectedMenu.noOfPeople || 1);

        if (currentHeads <= 1) {
            onSelectedMenusChange?.(selectedMenus.filter((item) => item.id !== menu.id));
            return;
        }

        const updated = normalizeSelectedMenu(selectedMenu, menuType, currentHeads - 1);

        onSelectedMenusChange?.(
            selectedMenus.map((item) => (item.id === menu.id ? updated : item)),
        );
    };

    return (
        <View style={styles.container}>
            {menuTypes.map((menuType) => {
                const expanded = !!expandedMap[menuType.id];
                const menus = menuType.menus || [];

                return (
                    <View key={menuType.id} style={styles.sectionWrapper}>
                        <Pressable onPress={() => toggleSection(menuType.id)} style={styles.sectionHeader}>
                            <SectionText text={menuType.name} textStyle={{ fontSize: 16 }} />
                            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#101828" />
                        </Pressable>

                        {expanded && (
                            <View style={styles.sectionBody}>
                                {menus.length === 0 ? (
                                    <BodyText text={emptyText} textStyle={{ marginTop: 8 }} />
                                ) : (
                                    menus.map((menu) => {
                                        const selected = selectedMenusMap.get(menu.id);
                                        const heads = Number(selected?.noOfPeople || 0);
                                        const unitPrice = getUnitPrice(menu);
                                        const subtotal = unitPrice * heads;

                                        return (
                                            <View key={menu.id} style={styles.menuCard}>
                                                <Pressable
                                                    onPress={() => handleToggleMenu(menu, menuType)}
                                                    style={styles.menuTitleRow}
                                                >
                                                    <SectionText text={menu.name} textStyle={{ flex: 1 }} />
                                                    <Ionicons
                                                        name={selected ? "checkmark-circle" : "ellipse-outline"}
                                                        size={28}
                                                        color={selected ? "#4DB77A" : "#EAECF0"}
                                                    />
                                                </Pressable>

                                                <BodyText
                                                    text={`${convertToThousand(unitPrice)}/${unitLabel}`}
                                                    textStyle={{ marginTop: 6, fontSize: 14 }}
                                                />

                                                <View style={styles.counterRow}>
                                                    <BodyText
                                                        text={selected ? `Subtotal: ${convertToThousand(subtotal)}` : "Not selected"}
                                                        textStyle={{ fontSize: 13, color: "#667085" }}
                                                    />
                                                    {showCounter && 
                                                        <View style={styles.counterWrap}>
                                                        <Pressable
                                                            onPress={() => handleDecrement(menu, menuType)}
                                                            style={styles.counterButtonLight}
                                                        >
                                                            <SectionText text="-" textStyle={{ fontSize: 14 }} />
                                                        </Pressable>

                                                        <SectionText text={String(heads)} textStyle={{ minWidth: 16, textAlign: "center" }} />

                                                        <Pressable
                                                            onPress={() => handleIncrement(menu, menuType)}
                                                            style={styles.counterButtonDark}
                                                        >
                                                            <SectionText text="+" textStyle={{ fontSize: 13, color: "#fff" }} />
                                                        </Pressable>
                                                    </View>
                                                    }
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        width: "100%",
        backgroundColor: "transparent",
    },
    sectionWrapper: {
        width: "100%",
        marginBottom: "10@ms",
        backgroundColor: "transparent",
    },
    sectionHeader: {
        width: "100%",
        minHeight: "56@vs",
        borderRadius: "14@ms",
        backgroundColor: "#E7ECF2",
        paddingHorizontal: "16@ms",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionBody: {
        width: "100%",
        marginTop: "10@ms",
        backgroundColor: "transparent",
    },
    menuCard: {
        width: "100%",
        borderRadius: "18@ms",
        paddingHorizontal: "14@ms",
        paddingVertical: "16@ms",
        backgroundColor: "#EDEDEE",
        marginBottom: "10@ms",
    },
    menuTitleRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
    },
    counterRow: {
        width: "100%",
        marginTop: "14@ms",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
    },
    counterWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "transparent",
    },
    counterButtonLight: {
        width: "26@ms",
        height: "26@ms",
        borderRadius: "13@ms",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#D9D9D9",
    },
    counterButtonDark: {
        width: "26@ms",
        height: "26@ms",
        borderRadius: "13@ms",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#101828",
    },
});

export default CollapsableSelections;

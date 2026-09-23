import React, { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import plateIcon from "../../../assets/icons/potOfSoupIcon.png";
import BodyText from "../../typography/BodyText";
import PrimaryLoader from "@/components/Loader";
import { getMenuTypes } from "@/services/menuTypeService";
import CollapsableSelections from "@/components/CollapsableSelections";
import { convertToThousand } from "@/helpers/utils";

interface ChooseMenusProps {
    title: string;
    description: string;
    serviceId: string;
    packg:{
        id: string;
        name: string;
        value: string;
        description?: string;
    }
    selectedMenus?: IMenuItem[];
    onSelectedMenusChange?: (nextValue: IMenuItem[]) => void;
    selectedMenusTouched?: boolean;
    selectedMenusError?: string;
}

export interface IMenuItem {
    id: string;
    name: string;
    description?: string;
    screenshot?: string;
    totalGroceryCost?: number;
    unitTotalGroceryCost?: number;
    noOfPeople?: number;
    menuTypeId?: string;
    menuTypeName?: string;
    groceries?: {
        groceryName: string;
        description?: string;
        unitPrice?: number;
        id?: string;
    }[];
}

export interface IMenuTypes {
    id: string;
    name: string;
    description?: string;
    menus?: IMenuItem[];
}


const ChooseMenus: React.FC<ChooseMenusProps> = ({
    title,
    description,
    packg,
    selectedMenus = [],
    onSelectedMenusChange,
    selectedMenusTouched,
    selectedMenusError
}) => {
    const [loadingMenus, setLoadingMenus] = useState<boolean>(false);
    const [menuTypes, setMenuTypes] = useState<IMenuTypes[]>([]);
    const selectedMenusTotalPrice = selectedMenus.reduce((sum, menu) => {
        return sum + Number(menu?.totalGroceryCost || 0);
    }, 0);
    const selectedMenuCount = selectedMenus.length;
    const selectedHeadsTotal = selectedMenus.reduce((sum, menu) => {
        return sum + Number(menu?.noOfPeople || 0);
    }, 0);

    const fetchMenuTypes = useCallback(async (packageId: string) => {
        try {
            setLoadingMenus(true);
            const response = await getMenuTypes({
                packageId,
                limit: 30,
                page: 1,
            });
            const fetchedMenuTypes = (response?.data?.data || []).map((item: any) => ({
                id: String(item?.id || item?._id || ""),
                name: String(item?.title || item?.name || "Untitled menu"),
                description: item?.description,
                menus: Array.isArray(item?.menus)
                    ? item.menus.map((menu: any) => ({
                        id: String(menu?.id || menu?._id || ""),
                        name: String(menu?.title || menu?.name || "Untitled menu"),
                        description: menu?.description,
                        screenshot: menu?.screenshot,
                        totalGroceryCost: Number(menu?.totalGroceryCost || 0),
                        unitTotalGroceryCost: Number(menu?.totalGroceryCost || 0),
                        noOfPeople: 0,
                        menuTypeId: String(item?.id || item?._id || ""),
                        menuTypeName: String(item?.title || item?.name || "Untitled menu"),
                        groceries: Array.isArray(menu?.groceries)
                            ? menu.groceries.map((grocery: any) => ({
                                groceryName: String(grocery?.groceryName || ""),
                                description: grocery?.description,
                                unitPrice: Number(grocery?.unitPrice || 0),
                                id: String(grocery?.id || grocery?._id || ""),
                            }))
                            : [],
                    }))
                    : [],
            }));
            setMenuTypes(fetchedMenuTypes);
        } catch {
            setMenuTypes([]);
        } finally {
            setLoadingMenus(false);
        }
    }, []);

    

    useEffect(() => {
        fetchMenuTypes(String(packg.id));
    }, [packg?.id, packg?.value, fetchMenuTypes]);

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={plateIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText text={description} textStyle={{ textAlign: 'center' }} />
                <BodyText
                    text={`Menu Cost : ${convertToThousand(selectedMenusTotalPrice)}`}
                    textStyle={{ color: "#ff681dff", marginTop: 8 }}
                />
                <BodyText
                    text={`${selectedMenuCount} menu${selectedMenuCount === 1 ? "" : "s"} selected • ${selectedHeadsTotal} head${selectedHeadsTotal === 1 ? "" : "s"}`}
                    textStyle={{ color: "#667085", marginTop: 4 }}
                />
                {!!(selectedMenusTouched && selectedMenusError) && (
                    <BodyText text={selectedMenusError} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>
            
                <FrameCard style={{ width: "100%" }}>
                    {/* <View style={styles.menuHeaderRow}>
                        <SectionText text="" />
                        <SectionText text={convertToThousand(selectedMenusTotalPrice)} textStyle={{ color: "#12B76A" }} />
                    </View> */}
                   

                    {loadingMenus ? (
                        <PrimaryLoader />
                    ) : menuTypes.length === 0 ? (
                        <BodyText text="No menu options found for this selection." textStyle={{ marginTop: 10 }} />
                    ) : (
                        <CollapsableSelections
                            menuTypes={menuTypes}
                            selectedMenus={selectedMenus}
                            onSelectedMenusChange={(nextValue) => onSelectedMenusChange?.(nextValue as IMenuItem[])}
                            emptyText="No menu options found for this section."
                        />
                    )}
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
});

export default ChooseMenus;
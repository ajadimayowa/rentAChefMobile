import FrameCard from "@/components/cards/FrameCard";
import IconWrapper from "@/components/cards/IconWrapper";
import { getBookingDetail } from "@/services/booking";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import cartIcon from "../../../assets/icons/cartIcon.png";

const formatCurrency = (amount?: number | null) => {
    if (typeof amount !== "number") return "₦0";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatDateOnly = (dateValue?: string | null) => {
    if (!dateValue) return "Not specified";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleDateString("en-NG", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatTimeOnly = (dateValue?: string | null) => {
    if (!dateValue) return "Not specified";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const DetailRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <View style={styles.rowWrap}>
        <View style={styles.rowLeft}>
            <View style={styles.rowIcon}>{icon}</View>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const PriceRow = ({ label, value, isTotal }: { label: string; value: string; isTotal?: boolean }) => (
    <View style={[styles.priceRow, isTotal && styles.totalRow]}>
        <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>{label}</Text>
        <Text style={[styles.priceValue, isTotal && styles.totalValue]}>{value}</Text>
    </View>
);

export default function ViewSpecialServiceBookingScreen() {
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ bookingName: string; bookingNumber: string }>();
    const [serviceDetails, setServiceDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const requestedServiceName = params.bookingName;
    const bookingNumberParam = params.bookingNumber;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Booking Details`,
            headerShown: true,
            headerStyle: styles.headerStyle,
            headerTintColor: "#fff",
            headerTitleStyle: {
                fontWeight: "600",
                fontFamily: "titleFont",
            },
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Entypo name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, requestedServiceName]);

    useEffect(() => {
        const handleFetchBookingDetails = async () => {
            if (!bookingNumberParam) return;
            try {
                setIsLoading(true);
                const response = await getBookingDetail(bookingNumberParam);
                const detail = Array.isArray(response) ? response[0] : response;
                setServiceDetails(detail || null);
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        handleFetchBookingDetails();
    }, [bookingNumberParam]);

    const bookingData = serviceDetails?.bookingData || {};
    const procurement = serviceDetails?.procurement || {};
    const selectedMenus = Array.isArray(bookingData?.selectedMenus) ? bookingData.selectedMenus : [];

    const bookingNumber = serviceDetails?.bookingNumber || bookingNumberParam || "N/A";
    const serviceName = bookingData?.serviceName || requestedServiceName || "Special Service";
    const bookingStatus = serviceDetails?.status || "Pending";
    const paymentStatus = serviceDetails?.paymentStatus || "Pending";
    const modeOfPayment = serviceDetails?.modeOfPayment || "N/A";
    const transactionRef = serviceDetails?.transactnRef || bookingData?.transactnRef || "N/A";

    return (
        <View style={styles.container}>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={styles.heroIconWrap}>
                    <Image source={cartIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>

                <Text style={styles.bookingTag}>Booking Number</Text>
                <Text style={styles.bookingNumber}>{bookingNumber}</Text>
                <Text style={styles.serviceName}>{serviceName}</Text>

                <View style={styles.statusPillsWrap}>
                    <View style={[styles.statusPill, styles.statusPillBlue]}>
                        <Ionicons name="checkmark-circle" size={14} color="#1D4ED8" />
                        <Text style={[styles.statusPillText, styles.statusPillTextBlue]}>{bookingStatus}</Text>
                    </View>
                    <View style={[styles.statusPill, styles.statusPillGreen]}>
                        <MaterialCommunityIcons name="credit-card-check" size={14} color="#15803D" />
                        <Text style={[styles.statusPillText, styles.statusPillTextGreen]}>{paymentStatus}</Text>
                    </View>
                </View>
            </FrameCard>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color="#1D4ED8" />
                        <Text style={styles.loaderText}>Loading booking details...</Text>
                    </View>
                ) : (
                    <>
                        <FrameCard style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Service Schedule</Text>
                            <DetailRow
                                icon={<Ionicons name="calendar-outline" size={16} color="#1D4ED8" />}
                                label="Start Date"
                                value={formatDateOnly(bookingData?.startDate)}
                            />
                            <DetailRow
                                icon={<Ionicons name="time-outline" size={16} color="#EA580C" />}
                                label="Arrival Time"
                                value={formatTimeOnly(bookingData?.arrivalTime)}
                            />
                            <DetailRow
                                icon={<Ionicons name="alarm-outline" size={16} color="#0E7490" />}
                                label="Service Time"
                                value={formatTimeOnly(bookingData?.serviceTime)}
                            />
                            <DetailRow
                                icon={<MaterialCommunityIcons name="cash-clock" size={16} color="#166534" />}
                                label="Payment Option"
                                value={bookingData?.paymentOption || "N/A"}
                            />
                        </FrameCard>

                        <FrameCard style={styles.detailCard}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.sectionTitle}>Selected Menus</Text>
                                <Text style={styles.menuCount}>{selectedMenus.length}</Text>
                            </View>

                            {selectedMenus.length === 0 ? (
                                <Text style={styles.emptyText}>No menu selected for this booking.</Text>
                            ) : (
                                selectedMenus.map((menu: any) => (
                                    <View key={menu?.id || menu?.name} style={styles.menuCard}>
                                        <Image source={{ uri: menu?.screenshot }} style={styles.menuImage} resizeMode="cover" />
                                        <View style={styles.menuInfo}>
                                            <Text style={styles.menuName}>{menu?.name || "Unnamed Menu"}</Text>
                                            <Text style={styles.menuType}>{menu?.menuTypeName || "General"}</Text>
                                            <Text style={styles.menuMeta}>People: {menu?.noOfPeople || 0}</Text>
                                            <Text style={styles.menuMeta}>Price/Head: {formatCurrency(menu?.pricePerHead)}</Text>
                                            <Text style={styles.menuMeta}>Total: {formatCurrency(menu?.totalGroceryCost)}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </FrameCard>

                        <FrameCard style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Payment & Pricing</Text>
                            <DetailRow
                                icon={<MaterialCommunityIcons name="cash-multiple" size={16} color="#166534" />}
                                label="Mode of Payment"
                                value={modeOfPayment}
                            />
                            <DetailRow
                                icon={<Ionicons name="receipt-outline" size={16} color="#334155" />}
                                label="Transaction Ref"
                                value={transactionRef}
                            />

                            <View style={styles.priceWrap}>
                                <PriceRow label="Grocery Total" value={formatCurrency(bookingData?.groceryTotalPrice)} />
                                <PriceRow label="Logistics Cost" value={formatCurrency(bookingData?.logisticsCost)} />
                                <PriceRow label="Service Charge" value={formatCurrency(bookingData?.serviceCharge)} />
                                <PriceRow label="VAT" value={formatCurrency(bookingData?.vat)} />
                                <PriceRow
                                    label="Procurement Fee"
                                    value={formatCurrency((procurement?.procurementFeeMinor || 0) / 100)}
                                />
                                <PriceRow
                                    label="Estimated Ingredient Cost"
                                    value={formatCurrency((procurement?.estimatedIngredientCostMinor || 0) / 100)}
                                />
                                <PriceRow
                                    label="Total Booking Cost"
                                    value={formatCurrency(bookingData?.totalBookingCost)}
                                    isTotal
                                />
                            </View>
                        </FrameCard>

                        <FrameCard style={styles.detailCard}>
                            <Text style={styles.sectionTitle}>Booking Meta</Text>
                            <DetailRow
                                icon={<Ionicons name="shield-checkmark-outline" size={16} color="#0F766E" />}
                                label="Terms Accepted"
                                value={bookingData?.acceptedTerms ? "Yes" : "No"}
                            />
                            <DetailRow
                                icon={<MaterialCommunityIcons name="credit-card-check-outline" size={16} color="#15803D" />}
                                label="Payment Status"
                                value={paymentStatus}
                            />
                            <DetailRow
                                icon={<Ionicons name="checkmark-done-circle-outline" size={16} color="#1D4ED8" />}
                                label="Booking Status"
                                value={bookingStatus}
                            />
                        </FrameCard>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F5",
        paddingHorizontal: "10@ms",
        paddingTop: "10@ms",
    },
    headerStyle: {
        backgroundColor: "#000000",
    },
    titleCard: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16@ms",
        paddingVertical: "16@ms",
        marginBottom: "8@ms",
        shadowColor: "#CBD5E1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 2,
    },
    heroIconWrap: {
        backgroundColor: "#EEF2FF",
        marginBottom: "4@ms",
    },
    bookingTag: {
        color: "#64748B",
        fontFamily: "primaryFont",
        fontSize: "12@ms",
    },
    bookingNumber: {
        color: "#0F172A",
        fontFamily: "secondaryFont",
        fontSize: "19@ms",
        marginTop: "2@ms",
    },
    serviceName: {
        color: "#475569",
        fontFamily: "primaryFont",
        fontSize: "14@ms",
        marginTop: "3@ms",
        marginBottom: "8@ms",
    },
    statusPillsWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: "8@ms",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "10@ms",
        paddingVertical: "5@ms",
        borderRadius: "999@ms",
        gap: "5@ms",
    },
    statusPillBlue: {
        backgroundColor: "#DBEAFE",
    },
    statusPillGreen: {
        backgroundColor: "#DCFCE7",
    },
    statusPillText: {
        fontSize: "12@ms",
        fontFamily: "secondaryFont",
    },
    statusPillTextBlue: {
        color: "#1D4ED8",
    },
    statusPillTextGreen: {
        color: "#15803D",
    },
    scrollContent: {
        paddingBottom: "20@ms",
    },
    detailCard: {
        borderRadius: "14@ms",
        padding: "12@ms",
        paddingVertical: "14@ms",
        marginTop: "6@ms",
    },
    sectionTitle: {
        fontFamily: "secondaryFont",
        fontSize: "16@ms",
        color: "#0F172A",
        marginBottom: "10@ms",
    },
    rowWrap: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10@ms",
        gap: "8@ms",
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    rowIcon: {
        width: "28@ms",
        height: "28@ms",
        borderRadius: "14@ms",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        marginRight: "8@ms",
    },
    rowLabel: {
        fontFamily: "primaryFont",
        fontSize: "13@ms",
        color: "#475569",
    },
    rowValue: {
        flex: 1,
        textAlign: "right",
        fontFamily: "secondaryFont",
        fontSize: "13@ms",
        color: "#0F172A",
    },
    menuHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8@ms",
    },
    menuCount: {
        minWidth: "24@ms",
        height: "24@ms",
        borderRadius: "12@ms",
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "#EEF2FF",
        color: "#1D4ED8",
        fontFamily: "secondaryFont",
        fontSize: "12@ms",
        paddingHorizontal: "6@ms",
    },
    emptyText: {
        fontFamily: "primaryFont",
        fontSize: "13@ms",
        color: "#64748B",
    },
    menuCard: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: "12@ms",
        padding: "8@ms",
        marginBottom: "8@ms",
        flexDirection: "row",
        gap: "8@ms",
        backgroundColor: "#FFFFFF",
    },
    menuImage: {
        width: "70@ms",
        height: "70@ms",
        borderRadius: "8@ms",
        backgroundColor: "#E5E7EB",
    },
    menuInfo: {
        flex: 1,
    },
    menuName: {
        color: "#0F172A",
        fontFamily: "secondaryFont",
        fontSize: "14@ms",
        marginBottom: "2@ms",
    },
    menuType: {
        color: "#334155",
        fontFamily: "primaryFont",
        fontSize: "12@ms",
        marginBottom: "4@ms",
    },
    menuMeta: {
        color: "#475569",
        fontFamily: "primaryFont",
        fontSize: "12@ms",
    },
    priceWrap: {
        marginTop: "6@ms",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingTop: "10@ms",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: "8@ms",
    },
    totalRow: {
        marginTop: "4@ms",
        paddingTop: "10@ms",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    priceLabel: {
        color: "#475569",
        fontFamily: "primaryFont",
        fontSize: "13@ms",
    },
    priceValue: {
        color: "#0F172A",
        fontFamily: "secondaryFont",
        fontSize: "13@ms",
    },
    totalLabel: {
        color: "#0F172A",
        fontFamily: "secondaryFont",
        fontSize: "14@ms",
    },
    totalValue: {
        color: "#111827",
        fontFamily: "secondaryFont",
        fontSize: "15@ms",
    },
    loaderWrap: {
        marginTop: "20@ms",
        alignItems: "center",
        justifyContent: "center",
    },
    loaderText: {
        marginTop: "8@ms",
        fontSize: "13@ms",
        color: "#475569",
        fontFamily: "primaryFont",
    },
});

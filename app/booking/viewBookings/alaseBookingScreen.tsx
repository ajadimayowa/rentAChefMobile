import FrameCard from "@/components/cards/FrameCard";
import IconWrapper from "@/components/cards/IconWrapper";
import { RootState } from "@/store";
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Pressable, ActivityIndicator, Animated, Easing } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useSelector } from "react-redux";
import cartIcon from "../../../assets/icons/cartIcon.png";
import { getBookingDetail } from "@/services/booking";

type StatusTone = {
    backgroundColor: string;
    textColor: string;
    iconColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
};

type ProteinOption = {
    label?: string;
    value?: string;
    count?: number;
};

const formatCurrency = (amount?: number | null) => {
    if (typeof amount !== "number") return "₦0";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDateTime = (dateValue?: string | null) => {
    if (!dateValue) return "Not specified";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleString("en-NG", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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

const formatWorkflow = (workflow?: string | null) => {
    if (!workflow) return "N/A";
    return workflow
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const getStatusTone = (statusText?: string | null): StatusTone => {
    const value = (statusText || "").toLowerCase();

    if (value.includes("paid") || value.includes("success") || value.includes("completed")) {
        return {
            backgroundColor: "#DCFCE7",
            textColor: "#166534",
            iconColor: "#15803D",
            iconName: "checkmark-circle",
        };
    }

    if (value.includes("pending") || value.includes("unpaid")) {
        return {
            backgroundColor: "#FEF3C7",
            textColor: "#92400E",
            iconColor: "#B45309",
            iconName: "time",
        };
    }

    if (value.includes("cancel") || value.includes("failed")) {
        return {
            backgroundColor: "#FEE2E2",
            textColor: "#991B1B",
            iconColor: "#DC2626",
            iconName: "close-circle",
        };
    }

    return {
        backgroundColor: "#DBEAFE",
        textColor: "#1D4ED8",
        iconColor: "#2563EB",
        iconName: "information-circle",
    };
};

const getProteinIconName = (value?: string) => {
    switch (value) {
        case "fullCow":
        case "halfCow":
            return "cow";
        case "ram":
            return "sheep";
        case "chickenCarton":
            return "food-drumstick";
        case "fishCarton":
            return "fish";
        default:
            return "food";
    }
};

const DetailRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <View style={styles.rowWrap}>
        <View style={styles.rowLeft}>
            <View style={styles.rowIcon}>{icon}</View>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const PriceRow = ({
    label,
    value,
    isTotal,
}: {
    label: string;
    value: string;
    isTotal?: boolean;
}) => (
    <View style={[styles.priceRow, isTotal && styles.totalRow]}>
        <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>{label}</Text>
        <Text style={[styles.priceValue, isTotal && styles.totalValue]}>{value}</Text>
    </View>
);

const ProteinCard = ({ protein }: { protein: ProteinOption }) => (
    <View style={styles.proteinCard}>
        <View style={styles.proteinIconWrap}>
            <MaterialCommunityIcons name={getProteinIconName(protein?.value)} size={18} color="#4F46E5" />
        </View>
        <Text style={styles.proteinLabel}>{protein?.label || "Protein"}</Text>
        <View style={styles.proteinCountPill}>
            <Text style={styles.proteinCount}>{protein?.count || 0}</Text>
        </View>
    </View>
);

const AnimatedSection = ({
    children,
    delay = 0,
}: {
    children: React.ReactNode;
    delay?: number;
}) => {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const translateAnim = useState(new Animated.Value(10))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 420,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
                toValue: 0,
                duration: 420,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay, fadeAnim, translateAnim]);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim }],
            }}
        >
            {children}
        </Animated.View>
    );
};


export default function ViewAlaseBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ bookingId: string, bookingName: string, bookingNumber: string }>();
    const [serviceDetails, setServiceDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const requestedServiceName = params.bookingName;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${requestedServiceName || "Alase"} Booking Details`,
            headerShown: true,
            headerStyle: styles.headerStyle,
            headerTintColor: "#fff",
            headerTitleStyle: {
                fontWeight: "600",
                fontFamily: "titleFont",
            },
            headerLeft: () => <TouchableOpacity onPress={() => navigation.goBack()}><Entypo name="chevron-left" size={24} color="white" /></TouchableOpacity>
        });
    }, [navigation, requestedServiceName]);
    
    const handleFetchBookingDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getBookingDetail(params.bookingNumber);
            console.log('Booking details fetched:', response);
            setServiceDetails(response[0]);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [params.bookingNumber]);

    useEffect(() => {
        handleFetchBookingDetails();
    }, [handleFetchBookingDetails]);

    const bookingData = serviceDetails?.bookingData || {};
    const procurement = serviceDetails?.procurement || {};
    const pricingSnapshot = serviceDetails?.pricingSnapshot || {};

    const bookingNumber = serviceDetails?.bookingNumber || params.bookingNumber || "N/A";
    const serviceName = bookingData?.serviceName || requestedServiceName || "Alase Service";
    const bookingStatus = serviceDetails?.status || "Pending";
    const paymentStatus = serviceDetails?.paymentStatus || "Pending";
    const modeOfPayment = serviceDetails?.modeOfPayment || "N/A";
    const transactionRef = serviceDetails?.transactnRef || bookingData?.transactnRef || "N/A";
    const bookingStatusTone = getStatusTone(bookingStatus);
    const paymentStatusTone = getStatusTone(paymentStatus);
    const proteinOptions: ProteinOption[] = Array.isArray(bookingData?.proteinOptions) ? bookingData?.proteinOptions : [];
    const selectedProteins = proteinOptions.filter((option) => (option?.count || 0) > 0);

    return (
        <View style={styles.container}>
            <AnimatedSection>
                <FrameCard style={styles.titleCard}>
                    <LinearGradient
                        colors={["#EEF2FF", "#F8FAFC", "#E0F2FE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.editWrap}>
                            <Pressable onPress={() => router.push("/booking/editBookings/editAlaseBookingScreen")}>
                                <FontAwesome name="edit" size={20} color="#1D4ED8" />
                            </Pressable>
                        </View>

                        <IconWrapper style={styles.heroIconWrap}>
                            <Image source={cartIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                        </IconWrapper>

                        <Text style={styles.bookingTag}>Booking ID</Text>
                        <Text style={styles.bookingNumber}>{bookingNumber}</Text>
                        <Text style={styles.serviceName}>{serviceName}</Text>

                        <View style={styles.statusPillsWrap}>
                            <View style={[styles.statusPill, { backgroundColor: bookingStatusTone.backgroundColor }]}>
                                <Ionicons name={bookingStatusTone.iconName} size={14} color={bookingStatusTone.iconColor} />
                                <Text style={[styles.statusPillText, { color: bookingStatusTone.textColor }]}>{bookingStatus}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: paymentStatusTone.backgroundColor }]}>
                                <MaterialCommunityIcons name="credit-card-check" size={14} color={paymentStatusTone.iconColor} />
                                <Text style={[styles.statusPillText, { color: paymentStatusTone.textColor }]}>{paymentStatus}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </FrameCard>
            </AnimatedSection>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color="#1D4ED8" />
                        <Text style={styles.loaderText}>Loading booking details...</Text>
                    </View>
                ) : (
                    <>
                        <AnimatedSection delay={40}>
                            <FrameCard style={styles.detailCard}>
                                <Text style={styles.sectionTitle}>Event Summary</Text>
                                <DetailRow
                                    icon={<Ionicons name="sparkles" size={16} color="#7C3AED" />}
                                    label="Workflow"
                                    value={formatWorkflow(serviceDetails?.workflow)}
                                />
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
                            </FrameCard>
                        </AnimatedSection>

                        <AnimatedSection delay={80}>
                            <FrameCard style={styles.detailCard}>
                                <Text style={styles.sectionTitle}>Protein Selection</Text>
                                <View style={styles.proteinGrid}>
                                    {(selectedProteins.length ? selectedProteins : proteinOptions).map((protein, index) => (
                                        <ProteinCard
                                            key={`${protein?.value || protein?.label || "protein"}-${index}`}
                                            protein={protein}
                                        />
                                    ))}
                                </View>
                            </FrameCard>
                        </AnimatedSection>

                        <AnimatedSection delay={120}>
                            <FrameCard style={styles.detailCard}>
                                <Text style={styles.sectionTitle}>Location & Notes</Text>
                                <DetailRow
                                    icon={<Ionicons name="location-outline" size={16} color="#BE123C" />}
                                    label="Event Address"
                                    value={bookingData?.eventAddress || bookingData?.addressOfEvent || "Not specified"}
                                />
                                <View style={styles.notesWrap}>
                                    <View style={styles.notesHeader}>
                                        <Ionicons name="document-text-outline" size={16} color="#475569" />
                                        <Text style={styles.notesLabel}>Additional Notes</Text>
                                    </View>
                                    <Text style={styles.notesText}>{bookingData?.additionalNotes || "No additional notes provided."}</Text>
                                </View>
                            </FrameCard>
                        </AnimatedSection>

                        <AnimatedSection delay={160}>
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
                                    <PriceRow label="Menu Total" value={formatCurrency(bookingData?.menuTotalPrice)} />
                                    <PriceRow label="VAT" value={formatCurrency(bookingData?.vat)} />
                                    <PriceRow label="Transportation" value={formatCurrency(bookingData?.transportationCost)} />
                                    <PriceRow label="Service Charge" value={formatCurrency(bookingData?.serviceCharge)} />
                                    <PriceRow
                                        label="Procurement Fee"
                                        value={formatCurrency((procurement?.procurementFeeMinor || 0) / 100)}
                                    />
                                    <PriceRow
                                        label="Estimated Ingredient Cost"
                                        value={formatCurrency((procurement?.estimatedIngredientCostMinor || 0) / 100)}
                                    />
                                    <PriceRow
                                        label="Estimated Snapshot Total"
                                        value={formatCurrency((pricingSnapshot?.estimatedTotalMinor || 0) / 100)}
                                    />
                                    <PriceRow
                                        label="Total Booking Cost"
                                        value={formatCurrency(
                                            bookingData?.totalBookingCost ||
                                            (pricingSnapshot?.estimatedTotalMinor ? pricingSnapshot?.estimatedTotalMinor / 100 : 0)
                                        )}
                                        isTotal
                                    />
                                </View>
                            </FrameCard>
                        </AnimatedSection>

                        <AnimatedSection delay={200}>
                            <FrameCard style={styles.detailCard}>
                                <Text style={styles.sectionTitle}>Booking Meta</Text>
                                <DetailRow
                                    icon={<Ionicons name="person-outline" size={16} color="#1E3A8A" />}
                                    label="Customer ID"
                                    value={serviceDetails?.customerId || profile?.id || "N/A"}
                                />
                                <DetailRow
                                    icon={<Ionicons name="restaurant-outline" size={16} color="#92400E" />}
                                    label="Service ID"
                                    value={serviceDetails?.serviceId || "N/A"}
                                />
                                <DetailRow
                                    icon={<Ionicons name="shield-checkmark-outline" size={16} color="#0F766E" />}
                                    label="Terms Accepted"
                                    value={bookingData?.acceptedTerms ? "Yes" : "No"}
                                />
                                <DetailRow
                                    icon={<Ionicons name="time-outline" size={16} color="#4338CA" />}
                                    label="Created At"
                                    value={formatDateTime(serviceDetails?.createdAt)}
                                />
                                <DetailRow
                                    icon={<Ionicons name="refresh-outline" size={16} color="#0369A1" />}
                                    label="Last Updated"
                                    value={formatDateTime(serviceDetails?.updatedAt)}
                                />
                            </FrameCard>
                        </AnimatedSection>
                    </>
                )}
            </ScrollView>
        </View>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F5',
        paddingHorizontal: "10@ms",
        paddingTop: "10@ms",
    },
    headerStyle: {
        backgroundColor: "#000000",
    },
    titleCard: {
        overflow: "hidden",
        borderRadius: "16@ms",
        marginBottom: "8@ms",
        shadowColor: "#CBD5E1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 2,
    },
    heroGradient: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: "16@ms",
        paddingHorizontal: "12@ms",
    },
    editWrap: {
        position: "absolute",
        top: "10@ms",
        right: "10@ms",
        width: "34@ms",
        height: "34@ms",
        borderRadius: "17@ms",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EFF6FF",
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
    statusPillText: {
        fontSize: "12@ms",
        fontFamily: "secondaryFont",
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
    notesWrap: {
        marginTop: "2@ms",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: "10@ms",
        padding: "10@ms",
        backgroundColor: "#FAFAFA",
    },
    notesHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "6@ms",
        gap: "6@ms",
    },
    notesLabel: {
        fontFamily: "secondaryFont",
        fontSize: "13@ms",
        color: "#334155",
    },
    notesText: {
        fontFamily: "primaryFont",
        fontSize: "13@ms",
        color: "#475569",
        lineHeight: "19@ms",
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
    proteinGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "8@ms",
    },
    proteinCard: {
        width: "48%",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: "12@ms",
        paddingVertical: "10@ms",
        paddingHorizontal: "10@ms",
        backgroundColor: "#F8FAFC",
    },
    proteinIconWrap: {
        width: "32@ms",
        height: "32@ms",
        borderRadius: "16@ms",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E0E7FF",
        marginBottom: "8@ms",
    },
    proteinLabel: {
        fontFamily: "secondaryFont",
        fontSize: "13@ms",
        color: "#1E293B",
        marginBottom: "8@ms",
    },
    proteinCountPill: {
        alignSelf: "flex-start",
        backgroundColor: "#EEF2FF",
        borderRadius: "999@ms",
        paddingHorizontal: "8@ms",
        paddingVertical: "3@ms",
    },
    proteinCount: {
        fontFamily: "secondaryFont",
        fontSize: "12@ms",
        color: "#4338CA",
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
})
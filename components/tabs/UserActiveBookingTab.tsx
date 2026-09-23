import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import PrimaryLoader from "../Loader";
import { getBookings } from "@/services/booking";
import moment from "moment";

type BookingItem = {
    id: string;
    workflow: string;
    bookingNumber: string;
    paymentStatus?: string;
    bookingData?: {
        serviceName?: string;
        startDate?: string;
    };
};

const UserActiveBookingTab: React.FC<any> = () => {
    const [bookings, setBookings] = useState<BookingItem[]>([])
    const localProfile = useSelector((user: RootState) => user.auth.bioData);

    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const getPaymentTone = (status?: string) => {
        const normalizedStatus = status?.toLowerCase() || "";

        if (normalizedStatus.includes("paid") || normalizedStatus.includes("success")) {
            return {
                label: status || "Paid",
                bg: "#DCFCE7",
                text: "#166534",
                icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
                iconColor: "#16A34A",
            };
        }

        if (normalizedStatus.includes("pending")) {
            return {
                label: status || "Pending",
                bg: "#FEF3C7",
                text: "#92400E",
                icon: "time" as keyof typeof Ionicons.glyphMap,
                iconColor: "#D97706",
            };
        }

        return {
            label: status || "Processing",
            bg: "#E0E7FF",
            text: "#3730A3",
            icon: "wallet" as keyof typeof Ionicons.glyphMap,
            iconColor: "#4F46E5",
        };
    }

    const getWorkflowMeta = (workflow?: string) => {
        switch (workflow) {
            case "DAILY_CHEF":
                return {
                    icon: "restaurant-outline" as keyof typeof Ionicons.glyphMap,
                    color: "#EA580C",
                    bg: "#FFF7ED",
                };
            case "EVENT_CATERING":
                return {
                    icon: "people-outline" as keyof typeof Ionicons.glyphMap,
                    color: "#9333EA",
                    bg: "#FAF5FF",
                };
            case "DATE_NIGHT":
                return {
                    icon: "heart-outline" as keyof typeof Ionicons.glyphMap,
                    color: "#DB2777",
                    bg: "#FDF2F8",
                };
            case "DINNER_PARTY":
                return {
                    icon: "wine-outline" as keyof typeof Ionicons.glyphMap,
                    color: "#0F766E",
                    bg: "#F0FDFA",
                };
            default:
                return {
                    icon: "sparkles-outline" as keyof typeof Ionicons.glyphMap,
                    color: "#2563EB",
                    bg: "#EFF6FF",
                };
        }
    }

    const fetchBookings = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getBookings(localProfile.id, "", limit, 1)

            if (res?.data) {
                setBookings(res?.data)
                setLoading(false)
            } else {
                setLoading(false)
                setBookings([])

            }

        } catch {
            setLoading(false)
            setBookings([])
        }
    }, [limit, localProfile.id])

    const handleViewBookingInfo = (booking: BookingItem) => {
        const params = {
            bookingId: booking?.id,
            bookingTitle: booking?.bookingData?.serviceName,
            workflow: booking?.workflow,
            bookingNumber: booking?.bookingNumber,
        };
        let resolvedRoute = '';

        switch (booking?.workflow) {
            case 'ALASE_SERVICE':
                resolvedRoute = '/booking/viewBookings/alaseBookingScreen';
                break;
            case 'DAILY_CHEF':
                resolvedRoute = '/booking/viewBookings/dailyChefBookingScreen';
                break;

            case 'DATE_NIGHT':
                resolvedRoute = '/booking/viewBookings/dateNightBookingScreen';
                break;

            case 'SPECIAL_SERVICE':
                resolvedRoute = '/booking/viewBookings/specialServiceBookingScreen';
                break;
            case 'DINNER_PARTY':
                resolvedRoute = '/booking/viewBookings/dinnerPartyBookingScreen';
                break;
            case 'EVENT_CATERING':
                resolvedRoute = '/booking/viewBookings/eventCateringBookingScreen';
                break;
            case 'STORAGE_PACKAGE':
                resolvedRoute = '/booking/viewBookings/storagePackageBookingScreen';
                break;

            case 'ALASE_SERVICE':
                resolvedRoute = '/booking/viewBookings/alaseBookingScreen';
                break;

            case 'HOME_RESIDENCE':
                resolvedRoute = '/booking/viewBookings/residentialBookingScreen';
                break;

            default:
                resolvedRoute = '';
                break;
        }
        router.push({ pathname: resolvedRoute as any, params });
    }
    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    return (
        <View style={style.container}>
            {
                loading ? <PrimaryLoader /> :
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={fetchBookings} tintColor="#2563EB" />
                        }
                        style={style.scrollView}
                        contentContainerStyle={style.scrollContent}
                    ><View style={{ gap: 5 }}>{
                            bookings.map((booking, index) => (
                                (() => {
                                    const workflowMeta = getWorkflowMeta(booking?.workflow);
                                    const paymentTone = getPaymentTone(booking?.paymentStatus);

                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleViewBookingInfo(booking)}
                                            key={index}
                                            activeOpacity={0.85}
                                            style={style.bookingCard}
                                        >
                                            <View style={style.cardTopRow}>
                                                <View style={[style.workflowIconWrap, { backgroundColor: workflowMeta.bg }]}>
                                                    <Ionicons name={workflowMeta.icon} size={20} color={workflowMeta.color} />
                                                </View>
                                                <View style={style.titleArea}>
                                                    <Text style={style.serviceName}>{booking?.bookingData?.serviceName || "Chef Service"}</Text>
                                                    <Text style={style.bookingNumber}>{booking?.bookingNumber || "No Booking Number"}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                                            </View>

                                            <View style={style.metaRow}>
                                                <View style={style.metaItem}>
                                                    <Ionicons name="calendar-outline" size={14} color="#2563EB" />
                                                    <Text style={style.metaText}>{moment(booking?.bookingData?.startDate).format('MMMM Do, YYYY')}</Text>
                                                </View>
                                                <View style={[style.statusChip, { backgroundColor: paymentTone.bg }]}>
                                                    <Ionicons name={paymentTone.icon} size={13} color={paymentTone.iconColor} />
                                                    <Text style={[style.statusText, { color: paymentTone.text }]}>{paymentTone.label}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })()
                            ))
                        }
                        </View>

                        {!loading && bookings.length === 0 && (
                            <View style={style.emptyStateWrap}>
                                <View style={style.emptyIconWrap}>
                                    <Ionicons name="calendar-clear-outline" size={24} color="#2563EB" />
                                </View>
                                <Text style={style.emptyTitle}>No active booking yet</Text>
                                <Text style={style.emptyText}>When you make a booking, it will appear here with status and timeline updates.</Text>
                            </View>
                        )}
                    </ScrollView>
            }
        </View>
    )
}



const style = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    scrollView: {
        width: "100%",
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: "5@s",
        paddingTop: "14@vs",
        paddingBottom: "30@vs",
        gap: "12@vs",
    },
    headerWrap: {
        backgroundColor: "#1D4ED8",
        borderRadius: "16@s",
        paddingVertical: "16@vs",
        paddingHorizontal: "14@s",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: "19@s",
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "#DBEAFE",
        marginTop: "5@vs",
        fontSize: "12@s",
        lineHeight: "18@vs",
    },
    bookingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "14@s",
        paddingVertical: "13@vs",
        paddingHorizontal: "12@s",
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
        borderWidth: 1,
        borderColor: "#EEF2F7",
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    workflowIconWrap: {
        height: "42@s",
        width: "42@s",
        borderRadius: "14@s",
        alignItems: "center",
        justifyContent: "center",
    },
    titleArea: {
        flex: 1,
        marginLeft: "10@s",
        marginRight: "8@s",
    },
    serviceName: {
        color: "#0F172A",
        fontSize: "15@s",
        fontWeight: "700",
    },
    bookingNumber: {
        color: "#64748B",
        fontSize: "11@s",
        marginTop: "2@vs",
    },
    metaRow: {
        marginTop: "12@vs",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@s",
    },
    metaText: {
        color: "#334155",
        fontSize: "11@s",
        fontWeight: "500",
    },
    statusChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@s",
        paddingHorizontal: "9@s",
        paddingVertical: "5@vs",
        borderRadius: "999@s",
    },
    statusText: {
        fontSize: "10@s",
        fontWeight: "700",
    },
    emptyStateWrap: {
        marginTop: "18@vs",
        backgroundColor: "#FFFFFF",
        borderRadius: "14@s",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingVertical: "24@vs",
        paddingHorizontal: "16@s",
        alignItems: "center",
    },
    emptyIconWrap: {
        width: "52@s",
        height: "52@s",
        borderRadius: "18@s",
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        marginTop: "10@vs",
        fontSize: "15@s",
        fontWeight: "700",
        color: "#0F172A",
    },
    emptyText: {
        marginTop: "6@vs",
        fontSize: "12@s",
        color: "#64748B",
        textAlign: "center",
        lineHeight: "18@vs",
    },
})
export default UserActiveBookingTab
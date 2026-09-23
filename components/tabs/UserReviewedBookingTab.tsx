import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { RootState } from "@/store";
import PrimaryLoader from "../Loader";
import { getBookings } from "@/services/booking";

type ReviewedBookingItem = {
    id?: string;
    bookingNumber?: string;
    bookingData?: {
        serviceName?: string;
        startDate?: string;
    };
};

const UserReviewedBookingTab: React.FC = () => {
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [bookings, setBookings] = useState<ReviewedBookingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const fetchReviewedBookings = useCallback(async () => {
        if (!localProfile?.id) {
            setBookings([]);
            return;
        }

        setLoading(true);
        try {
            const res = await getBookings(localProfile.id, "Completed", limit, 1);
            setBookings(res?.data || []);
        } catch {
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [limit, localProfile?.id]);

    useEffect(() => {
        fetchReviewedBookings();
    }, [fetchReviewedBookings]);

    if (loading) {
        return <PrimaryLoader />;
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReviewedBookings} tintColor="#2563EB" />}
            contentContainerStyle={style.scrollContent}
        >
            {bookings.map((booking, index) => (
                <TouchableOpacity key={booking?.id || String(index)} activeOpacity={0.85} style={style.bookingCard}>
                    <View style={style.cardTopRow}>
                        <View style={style.iconWrap}>
                            <Ionicons name="checkmark-done-outline" size={18} color="#166534" />
                        </View>
                        <View style={style.titleArea}>
                            <Text style={style.serviceName}>{booking?.bookingData?.serviceName || "Chef Service"}</Text>
                            <Text style={style.bookingNumber}>{booking?.bookingNumber || "No Booking Number"}</Text>
                        </View>
                    </View>

                    <View style={style.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color="#2563EB" />
                        <Text style={style.metaText}>
                            {booking?.bookingData?.startDate
                                ? moment(booking.bookingData.startDate).format("MMMM Do, YYYY")
                                : "No date available"}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}

            {!loading && bookings.length === 0 && (
                <View style={style.emptyStateWrap}>
                    <View style={style.emptyIconWrap}>
                        <Ionicons name="chatbox-ellipses-outline" size={24} color="#2563EB" />
                    </View>
                    <Text style={style.emptyTitle}>No reviewed bookings yet</Text>
                    <Text style={style.emptyText}>Completed bookings that have been reviewed will appear here.</Text>
                </View>
            )}
        </ScrollView>
    );
};

const style = ScaledSheet.create({
    scrollContent: {
        paddingHorizontal: "4@s",
        paddingTop: "6@vs",
        paddingBottom: "24@vs",
        gap: "10@vs",
    },
    bookingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "14@s",
        paddingVertical: "13@vs",
        paddingHorizontal: "12@s",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconWrap: {
        height: "38@s",
        width: "38@s",
        borderRadius: "12@s",
        backgroundColor: "#DCFCE7",
        alignItems: "center",
        justifyContent: "center",
    },
    titleArea: {
        flex: 1,
        marginLeft: "10@s",
    },
    serviceName: {
        color: "#0F172A",
        fontSize: "14@s",
        fontWeight: "700",
    },
    bookingNumber: {
        color: "#64748B",
        fontSize: "11@s",
        marginTop: "2@vs",
    },
    metaRow: {
        marginTop: "10@vs",
        flexDirection: "row",
        alignItems: "center",
        gap: "4@s",
    },
    metaText: {
        color: "#334155",
        fontSize: "11@s",
        fontWeight: "500",
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
});

export default UserReviewedBookingTab;

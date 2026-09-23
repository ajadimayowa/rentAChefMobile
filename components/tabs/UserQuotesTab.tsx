import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useSelector } from "react-redux";
import moment from "moment";
import { RootState } from "@/store";
import PrimaryLoader from "../Loader";
import { getQuotes, QuotePayload } from "@/services/Quote";

const UserQuotesTab: React.FC = () => {
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [quotes, setQuotes] = useState<QuotePayload[]>([]);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const getStatusTone = (status?: string) => {
        switch ((status || "PENDING").toUpperCase()) {
            case "RESPONDED":
                return {
                    bg: "#DCFCE7",
                    text: "#166534",
                    icon: "chatbubble-ellipses-outline" as keyof typeof Ionicons.glyphMap,
                    label: "Responded",
                };
            case "CLOSED":
                return {
                    bg: "#E2E8F0",
                    text: "#334155",
                    icon: "checkmark-done-outline" as keyof typeof Ionicons.glyphMap,
                    label: "Closed",
                };
            default:
                return {
                    bg: "#FEF3C7",
                    text: "#92400E",
                    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
                    label: "Pending",
                };
        }
    };

    const fetchQuotes = useCallback(async () => {
        if (!localProfile?.id) {
            setQuotes([]);
            return;
        }

        setLoading(true);
        try {
            const res = await getQuotes({
                page: 1,
                limit,
                customerId: localProfile.id,
            });
            setQuotes(res?.data || []);
        } catch {
            setQuotes([]);
        } finally {
            setLoading(false);
        }
    }, [limit, localProfile?.id]);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    if (loading) {
        return <PrimaryLoader />;
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchQuotes} tintColor="#2563EB" />}
            contentContainerStyle={style.scrollContent}
        >
            {quotes.map((quote, index) => {
                const statusTone = getStatusTone(quote?.status);
                return (
                    <View key={quote?._id || quote?.id || String(index)} style={style.quoteCard}>
                        <View style={style.cardTopRow}>
                            <View style={style.iconWrap}>
                                <Ionicons name="document-text-outline" size={18} color="#2563EB" />
                            </View>
                            <View style={style.titleArea}>
                                <Text style={style.quoteTitle}>{quote?.title || "Untitled quote"}</Text>
                                <Text style={style.quoteDate}>
                                    {quote?.createdAt ? moment(quote.createdAt).format("MMMM Do, YYYY") : "Date unavailable"}
                                </Text>
                            </View>
                            <View style={[style.statusChip, { backgroundColor: statusTone.bg }]}>
                                <Ionicons name={statusTone.icon} size={13} color={statusTone.text} />
                                <Text style={[style.statusText, { color: statusTone.text }]}>{statusTone.label}</Text>
                            </View>
                        </View>

                        <Text style={style.quoteDescription}>{quote?.description || "No description"}</Text>

                        {!!quote?.adminResponse?.message && (
                            <View style={style.responseWrap}>
                                <Text style={style.responseTitle}>Admin response</Text>
                                <Text style={style.responseText}>{quote.adminResponse.message}</Text>
                            </View>
                        )}
                    </View>
                );
            })}

            {!loading && quotes.length === 0 && (
                <View style={style.emptyStateWrap}>
                    <View style={style.emptyIconWrap}>
                        <Ionicons name="mail-unread-outline" size={24} color="#2563EB" />
                    </View>
                    <Text style={style.emptyTitle}>No quotes yet</Text>
                    <Text style={style.emptyText}>Quotes you post will show up here, including status and admin responses.</Text>
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
    quoteCard: {
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
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
    },
    titleArea: {
        flex: 1,
        marginLeft: "10@s",
        marginRight: "8@s",
    },
    quoteTitle: {
        color: "#0F172A",
        fontSize: "14@s",
        fontWeight: "700",
    },
    quoteDate: {
        color: "#64748B",
        fontSize: "11@s",
        marginTop: "2@vs",
    },
    statusChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@s",
        paddingHorizontal: "8@s",
        paddingVertical: "4@vs",
        borderRadius: "999@s",
    },
    statusText: {
        fontSize: "10@s",
        fontWeight: "700",
    },
    quoteDescription: {
        marginTop: "10@vs",
        color: "#334155",
        fontSize: "12@s",
        lineHeight: "18@vs",
    },
    responseWrap: {
        marginTop: "10@vs",
        borderRadius: "10@s",
        padding: "10@s",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    responseTitle: {
        color: "#0F172A",
        fontSize: "11@s",
        fontWeight: "700",
        marginBottom: "4@vs",
    },
    responseText: {
        color: "#475569",
        fontSize: "11@s",
        lineHeight: "16@vs",
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

export default UserQuotesTab;

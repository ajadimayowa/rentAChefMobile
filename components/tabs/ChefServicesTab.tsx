import { RefreshControl, ScrollView, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "../typography/SectionText";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import PrimaryLoader from "../Loader";
import BodyText from "../typography/BodyText";
import Colors from "@/constants/Colors";
import TitleText from "../typography/TitleText";
import { getChefServices, IChefServiceItem } from "@/services/chefService";

const ChefServicesTab: React.FC = () => {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<IChefServiceItem[]>([]);

    const fetchChefServices = async () => {
        if (!id) {
            setServices([]);
            return;
        }

        setLoading(true);
        try {
            const response = await getChefServices({ chefId: id, limit: 50, page: 1 });
            setServices(response);
        } catch (error: any) {
            setServices([]);
            Toast.show({
                type: "error",
                text1: "Could not load services",
                text2: error?.response?.data?.message || "Please pull to refresh.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChefServices();
    }, [id]);

    return (
        <View style={style.container}>
            <View style={style.headerCard}>
                <View style={style.headerIconWrap}>
                    <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#F8C561" />
                </View>
                <View style={{ flex: 1 }}>
                    <TitleText text="Services" textStyle={style.headerTitle} />
                    <BodyText text={`${services.length} curated offer${services.length === 1 ? "" : "s"}`} textStyle={style.headerSubtitle} />
                </View>
            </View>

            {loading && <PrimaryLoader />}

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchChefServices} tintColor={Colors.primary.base} />
                }
                contentContainerStyle={style.contentContainer}
                style={style.scroll}>

                {
                    services?.length > 0 ?
                        services.map((service, index) => (
                            <View key={service?.id || index} style={style.calendarcard}>
                                <View style={style.iconBlock}>
                                    <MaterialCommunityIcons name={(service?.icon as any) || "chef-hat"} size={18} color="#F7B940" />
                                </View>

                                <View style={style.serviceInfoWrap}>
                                    <SectionText text={service?.name} textStyle={style.serviceTitle} />
                                    {service?.description ? (
                                        <BodyText text={service.description} textStyle={style.serviceDescription} />
                                    ) : null}
                                </View>

                                <View style={[style.availabilityPill, service?.isAvailable ? style.availablePill : style.unavailablePill]}>
                                    <MaterialCommunityIcons
                                        name={service?.isAvailable ? "check-decagram" : "pause-circle"}
                                        size={12}
                                        color={service?.isAvailable ? "#0D5C46" : "#7A3E00"}
                                    />
                                    <BodyText
                                        text={service?.isAvailable ? "Available" : "Unavailable"}
                                        textStyle={[style.availabilityText, service?.isAvailable ? style.availableText : style.unavailableText]}
                                    />
                                </View>
                            </View>)) :
                        <View style={style.emptyState}>
                            <MaterialCommunityIcons name="silverware-clean" size={34} color="#AEB4BC" />
                            <BodyText text="No services listed yet." textStyle={style.emptyStateTitle} />
                            <BodyText text="Check back shortly for this chef's premium offerings." textStyle={style.emptyStateSub} />
                        </View>
                }

            </ScrollView>
        </View>

    )
}



const style = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FA"
    },
    scroll: {
        width: "100%",
        flex: 1,
    },
    contentContainer: {
        paddingBottom: "14@vs",
    },
    headerCard: {
        marginBottom: "12@vs",
        flexDirection: "row",
        alignItems: "center",
        gap: "10@s",
        borderRadius: "16@s",
        paddingHorizontal: "14@s",
        paddingVertical: "12@vs",
        backgroundColor: "#111827",
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    headerIconWrap: {
        width: "34@s",
        height: "34@s",
        borderRadius: "17@s",
        backgroundColor: "#1E293B",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontFamily: "titleFont",
        fontSize: "16@ms",
        marginBottom: "2@vs",
    },
    headerSubtitle: {
        color: "#D1D5DB",
        fontSize: "12@ms",
    },
    calendarcard: {
        width: "100%",
        marginBottom: "10@vs",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: "12@vs",
        paddingHorizontal: "12@s",
        backgroundColor: "#FFFFFF",
        borderRadius: "14@s",
        borderWidth: 1,
        borderColor: "#E8ECF1",
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    iconBlock: {
        width: "34@s",
        height: "34@s",
        borderRadius: "17@s",
        backgroundColor: "#FFF7E6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "10@s",
    },
    serviceInfoWrap: {
        flex: 1,
        paddingRight: "8@s",
    },
    serviceTitle: {
        color: "#0F172A",
        fontFamily: "bodyBold",
        marginBottom: "2@vs",
    },
    serviceDescription: {
        color: "#64748B",
        fontSize: "11@ms",
        lineHeight: "16@ms",
    },
    availabilityPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: "4@s",
        borderRadius: "20@s",
        paddingVertical: "5@vs",
        paddingHorizontal: "8@s",
        borderWidth: 1,
    },
    availablePill: {
        backgroundColor: "#E9F9F2",
        borderColor: "#B7E8D6",
    },
    unavailablePill: {
        backgroundColor: "#FFF5E9",
        borderColor: "#F5D6B8",
    },
    availabilityText: {
        fontSize: "10@ms",
        fontFamily: "bodyBold",
    },
    availableText: {
        color: "#0D5C46",
    },
    unavailableText: {
        color: "#7A3E00",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: "14@s",
        borderWidth: 1,
        borderColor: "#E8ECF1",
        paddingVertical: "24@vs",
        paddingHorizontal: "14@s",
    },
    emptyStateTitle: {
        marginTop: "8@vs",
        fontFamily: "bodyBold",
        color: "#1F2937",
    },
    emptyStateSub: {
        marginTop: "2@vs",
        textAlign: "center",
        color: "#94A3B8",
        fontSize: "11@ms",
    },
})
export default ChefServicesTab;
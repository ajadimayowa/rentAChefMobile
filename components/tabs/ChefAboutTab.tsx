import { Image, ScrollView, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "../typography/SectionText";
import PrimaryLoader from "../Loader";
import BodyText from "../typography/BodyText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import TitleText from "../typography/TitleText";
import { IChefProfile } from "@/interfaces/chef";
import { maskLast4, maskFirst5 } from "@/helpers/utils";

export interface IChefABout {
    data?: IChefProfile
}
const ChefAboutTab: React.FC<IChefABout> = ({ data }) => {
    const chef = data?.chef;
    const chefDetails = chef?.chefDetails;

    const specialties = Array.isArray(chefDetails?.specialties)
        ? chefDetails.specialties.filter((item: string) => !!item)
        : [];

    const certifications = Array.isArray(chefDetails?.certifications)
        ? chefDetails.certifications.filter((item: string) => !!item)
        : [];

    const servicesOffered = Array.isArray(data?.servicesOffered)
        ? data.servicesOffered
            .map((item) => item?.name)
            .filter((name): name is string => !!name)
        : [];

    const chefLevelName = typeof chefDetails?.chefLevel === "string"
        ? undefined
        : chefDetails?.chefLevel?.name;

    const rating = Number(chefDetails?.rating || 0);
    const totalChefBooking = Number(data?.totalChefBooking || 0);
    const totalCompletedBooking = Number(data?.totalCompletedBooking || 0);
    const totalUpcoming = Number(data?.totalUpcoming || 0);

    const location = [chef?.address?.city, chef?.address?.stateName].filter(Boolean).join(", ") || "No location provided";

    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, index) => {
            const isActive = index < rating;
            return (
                <MaterialCommunityIcons
                    key={index}
                    name={isActive ? "star" : "star-outline"}
                    size={16}
                    color={isActive ? "#F4B400" : "#B6B6B6"}
                />
            );
        });
    };

    return (
        <>
        {
            chef?.fullName === undefined ? <PrimaryLoader/> :
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}>

                <View style={styles.heroCard}>
                    <View style={styles.headerRow}>
                        <Image
                            source={{ uri: chef?.profilePic }}
                            style={styles.avatar}
                        />
                        <View style={styles.headerTextWrap}>
                            <TitleText text={chef?.fullName || "Chef"} textStyle={styles.name} />
                            <View style={styles.categoryPill}>
                                <BodyText text={chefLevelName || "Chef"} textStyle={styles.categoryText} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <Ionicons name="location" size={15} color="#6B7280" />
                        <BodyText text={location} textStyle={styles.metaText} />
                    </View>

                    <View style={styles.metaRow}>
                        <BodyText text="Rating" textStyle={styles.metaLabel} />
                        <View style={styles.ratingWrap}>{renderStars()}</View>
                        <BodyText text={`${rating}/5`} textStyle={styles.ratingText} />
                    </View>

                    <View style={styles.idPill}>
                        <BodyText text={`Staff ID: ${chefDetails?.staffId || "-"}`} textStyle={styles.idText} />
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <SectionText text="Total" textStyle={styles.statLabel} />
                        <TitleText text={`${totalChefBooking}`} textStyle={styles.statValue} />
                        <BodyText text="Bookings" textStyle={styles.statCaption} />
                    </View>
                    <View style={styles.statCard}>
                        <SectionText text="Completed" textStyle={styles.statLabel} />
                        <TitleText text={`${totalCompletedBooking}`} textStyle={styles.statValue} />
                        <BodyText text="Jobs" textStyle={styles.statCaption} />
                    </View>
                    <View style={styles.statCard}>
                        <SectionText text="Upcoming" textStyle={styles.statLabel} />
                        <TitleText text={`${totalUpcoming}`} textStyle={styles.statValue} />
                        <BodyText text="Bookings" textStyle={styles.statCaption} />
                    </View>
                </View>

                <View style={styles.card}>
                    <SectionText text="About" textStyle={styles.cardTitle} />
                    <BodyText text={chefDetails?.bio || "No biography available yet."} textStyle={styles.cardBody} />
                </View>

                <View style={styles.card}>
                    <SectionText text="Experience" textStyle={styles.cardTitle} />
                    <View style={styles.infoRow}>
                        <BodyText text="Years of experience" textStyle={styles.infoLabel} />
                        <BodyText text={`${chefDetails?.yearsOfExperience || 0} years`} textStyle={styles.infoValue} />
                    </View>
                    <View style={styles.infoRow}>
                        <BodyText text="Email" textStyle={styles.infoLabel} />
                        <BodyText text={maskFirst5(chef?.email)} textStyle={styles.infoValue} />
                    </View>
                    <View style={styles.infoRow}>
                        <BodyText text="Phone" textStyle={styles.infoLabel} />
                        <BodyText text={maskLast4(chef?.phoneNumber)} textStyle={styles.infoValue} />
                    </View>
                </View>

                <View style={styles.card}>
                    <SectionText text="Specialties" textStyle={styles.cardTitle} />
                    <View style={styles.chipsRow}>
                        {specialties.length > 0 ? (
                            specialties.map((spe: string, key: number) => (
                                <View key={key} style={styles.chip}>
                                    <BodyText text={spe} textStyle={styles.chipText} />
                                </View>
                            ))
                        ) : (
                            <BodyText text="No specialties listed yet." textStyle={styles.emptyStateText} />
                        )}
                    </View>
                </View>

                <View style={styles.card}>
                    <SectionText text="Services Offered" textStyle={styles.cardTitle} />
                    {servicesOffered.length > 0 ? (
                        servicesOffered.map((service: string, idx: number) => (
                            <View key={`${service}-${idx}`} style={styles.listRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#1F7A5A" />
                                <BodyText text={service} textStyle={styles.listText} />
                            </View>
                        ))
                    ) : (
                        <BodyText text="No services have been added yet." textStyle={styles.emptyStateText} />
                    )}
                </View>

                <View style={styles.card}>
                    <SectionText text="Certifications" textStyle={styles.cardTitle} />
                    {certifications.length > 0 ? (
                        certifications.map((cert: string, idx: number) => (
                            <View key={`${cert}-${idx}`} style={styles.listRow}>
                                <Ionicons name="ribbon" size={15} color="#A86E1C" />
                                <BodyText text={cert} textStyle={styles.listText} />
                            </View>
                        ))
                    ) : (
                        <BodyText text="No certifications available." textStyle={styles.emptyStateText} />
                    )}
                </View>
            </ScrollView>
        }
            
        </>

    )
}



const styles = ScaledSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#F8F6F2",
    },
    contentContainer: {
        paddingHorizontal: "14@ms",
        paddingTop: "8@ms",
        paddingBottom: "30@ms",
        gap: "12@ms",
    },
    heroCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: "18@ms",
        padding: "14@ms",
        shadowColor: "#121212",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#EFE9DE",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: "10@ms",
        marginBottom: "8@ms",
    },
    avatar: {
        width: "62@ms",
        height: "62@ms",
        borderRadius: "31@ms",
        backgroundColor: "#ECECEC",
    },
    headerTextWrap: {
        flex: 1,
        gap: "4@ms",
    },
    name: {
        fontSize: "23@ms",
        lineHeight: "26@ms",
        color: "#191919",
    },
    categoryPill: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF0DD",
        borderRadius: "14@ms",
        paddingVertical: "3@ms",
        paddingHorizontal: "10@ms",
    },
    categoryText: {
        color: "#A96300",
        fontSize: "12@ms",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: "6@ms",
        marginTop: "6@ms",
        flexWrap: "wrap",
    },
    metaText: {
        color: "#5A5A5A",
    },
    metaLabel: {
        color: "#4A4A4A",
        fontFamily: "secondaryFont",
    },
    ratingWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: "1@ms",
    },
    ratingText: {
        color: "#6E6E6E",
    },
    idPill: {
        marginTop: "10@ms",
        alignSelf: "flex-start",
        backgroundColor: "#EEF4EA",
        borderRadius: "12@ms",
        paddingVertical: "4@ms",
        paddingHorizontal: "10@ms",
    },
    idText: {
        color: "#3E6237",
        fontSize: "12@ms",
    },
    statsRow: {
        flexDirection: "row",
        gap: "8@ms",
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: "14@ms",
        paddingVertical: "10@ms",
        paddingHorizontal: "8@ms",
        borderWidth: 1,
        borderColor: "#EFE9DE",
        alignItems: "center",
    },
    statLabel: {
        color: "#6F6B63",
        fontSize: "12@ms",
    },
    statValue: {
        fontSize: "24@ms",
        lineHeight: "30@ms",
        color: "#1B1B1B",
    },
    statCaption: {
        color: "#8D877E",
        fontSize: "12@ms",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "14@ms",
        padding: "12@ms",
        borderWidth: 1,
        borderColor: "#EFE9DE",
        gap: "8@ms",
    },
    cardTitle: {
        color: "#252525",
        fontSize: "16@ms",
    },
    cardBody: {
        color: "#535353",
        lineHeight: "20@ms",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8@ms",
        borderBottomWidth: 1,
        borderBottomColor: "#F1EEE8",
        paddingBottom: "8@ms",
    },
    infoLabel: {
        color: "#7B7B7B",
        flex: 1,
    },
    infoValue: {
        color: "#232323",
        fontFamily: "secondaryFont",
        flex: 1,
        textAlign: "right",
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "6@ms",
    },
    chip: {
        paddingVertical: "5@ms",
        paddingHorizontal: "10@ms",
        borderRadius: "20@ms",
        backgroundColor: "#F2F6ED",
        borderWidth: 1,
        borderColor: "#DCE7D3",
    },
    chipText: {
        color: "#35592C",
        fontSize: "13@ms",
    },
    listRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: "8@ms",
    },
    listText: {
        color: "#353535",
        flex: 1,
    },
    emptyStateText: {
        color: "#8A8A8A",
    },
})
export default ChefAboutTab;
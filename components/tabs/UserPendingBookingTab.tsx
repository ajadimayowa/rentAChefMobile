import { RefreshControl, ScrollView, TextInput, Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "../typography/SectionText";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import SecureStorage from "@/store/secureStore";
import Toast from "react-native-toast-message";
// import { IAd } from "@/interfaces/ads";
import api from "@/services/apiConfig";
// import ReusableAdCard from "../cards/AdCard";
import PrimaryLoader from "../Loader";
import BodyText from "../typography/BodyText";
import Colors from "@/constants/Colors";
import { convertToThousand } from "@/helpers/utils";
import moment from "moment";
import { Booking } from "@/interfaces/booking";

const UserPendingBookingTab: React.FC<any> = () => {
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [bookings, setBookings] = useState<any[]>([])

    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()
    const handleLogout = async () => {
        await persistor.purge();
        await SecureStorage.removeItem('userToken')
        router.replace('/');

    }
    const fetchBookings = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        setLoading(true)
        try {
            const res = await api.get(`/bookings?clientId=${localProfile.id}&status=confirmed`)

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Profile Fetched'
                // });
                setBookings(res?.data?.payload)
                setLoading(false)
            } else {
                setLoading(false)
                // Toast.show({
                //     type: 'error',
                //     text1: 'Session Expired!'
                // });
                setBookings([])

            }

        } catch (error: any) {
            setLoading(false)
            //  Toast.show({
            //         type: 'error',
            //         text1: 'Session Expired!'
            //     });
            setBookings([])
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])
    return (
        <View style={style.container}>
            {
                loading ? <PrimaryLoader /> :
                    <ScrollView
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={fetchBookings} />
                        }
                        style={{ width: '100%', flex: 1 }}>


                        {
                            bookings.map((booking:Booking, index) => (
                                <TouchableOpacity key={index} onPress={() => router.push({ pathname: '/clientviewbookinginfo', params: { id: booking?.id } })}>
                                    <View style={[style.card]}>
                                        <View style={style.rowSection}>
                                            <SectionText text={booking?.serviceId?.name ?? booking?.specialMenuId?.title} />
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'Booking Type'} />
                                            <BodyText text={booking?.bookingType} />
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'Start Date'} />
                                            <BodyText text={moment(booking?.startDate).format('DD-MM-YYYY')} />
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'End Date'} />
                                            <BodyText text={moment(booking?.endDate).format('DD-MM-YYYY')} />
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'Procurement Paid'} />
                                            <View style={{ backgroundColor: booking?.procurementId?.isProcurementPaid ? '#297e59ff' : '#ffbc40ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }} >
                                                <BodyText textStyle={{color:'#ffffffff'}}  text={booking?.procurementId?.isProcurementPaid ? 'Yes' : 'No'} />
                                            </View>
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'Amount'} />
                                            <BodyText text={convertToThousand(booking?.bookingFeeAmount)} />
                                        </View>

                                        <View style={style.rowSection}>
                                            <BodyText text={'Status'} />
                                            <BodyText text={booking?.status} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }



                    </ScrollView>
            }

            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {
                    !loading && bookings.length == 0 && <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}><BodyText text="You have no booking" /></View>
                }
            </View>
        </View>
    )
}



const style = ScaledSheet.create({
    container: { flex: 1 },
    sectionTitle: { fontSize: "16@s", marginVertical: "10@vs", fontFamily: 'titleFont' },

    btncontainer: {
        paddingVertical: "5@ms",
        paddingHorizontal: "10@ms",
        borderRadius: "20@ms",
        alignSelf: "flex-start",
        alignItems: 'center',
        justifyContent: 'center',
        height: '100@ms',
        width: '100@ms',
        // ✅ Drop shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 4,

        // ✅ Drop shadow (Android)
        elevation: 4,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 10,
        backgroundColor: "#ff733b",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    card: {
        width: "100%",
        marginTop: "10@vs",
        marginBottom: "10@vs",
        gap: "10@s",
        flexDirection: "row",
        flexWrap: "wrap",
        padding: "12@s",
        backgroundColor: "#fff",
        borderRadius: "12@s",

        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,

        // Android shadow
        elevation: 5,
    },
    rowSection: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    catbtncontainer: {
        paddingVertical: "5@ms",
        paddingHorizontal: "10@ms",
        borderRadius: "20@ms",
        alignSelf: "flex-start",
        alignItems: 'center',
        // ✅ Drop shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 4,

        // ✅ Drop shadow (Android)
        elevation: 4,
    },
    text: {
        fontSize: "14@ms",
        fontWeight: "600",
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },
})
export default UserPendingBookingTab
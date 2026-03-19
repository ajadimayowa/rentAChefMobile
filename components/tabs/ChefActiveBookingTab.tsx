import { RefreshControl, ScrollView, TextInput,Text, TouchableOpacity, View } from "react-native"
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

const ChefActiveBookingTab: React.FC<any> = () => {
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
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/bookings?clientId=${localProfile.id}&status=ongoing`)

            console.log({ seeRes: res })

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Profile Fetched'
                // });
                setBookings(res?.data?.payload)
                setLoading(false)
            } else {

                console.log({ seeAfter: res })
                setLoading(false)
                // Toast.show({
                //     type: 'error',
                //     text1: 'Session Expired!'
                // });
                setBookings([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
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
                            bookings.map((booking, index) => (
                                <TouchableOpacity key={index} style={{width:'100%', borderRadius:5,margin:5, padding:'5%', backgroundColor:'#fff'}}>
                                    <SectionText text={booking?.serviceId?.name??booking?.title}/>
                                </TouchableOpacity>
                            ))
                        }



                    </ScrollView>
            }

            <View style={{width:'100%',alignItems:'center',justifyContent:'center'}}>
                {
                    !loading && bookings.length == 0 && <View style={{width:'100%',alignItems:'center',justifyContent:'center'}}><BodyText text="You have no active booking" /></View>
                }
            </View>
        </View>
    )
}



const style = ScaledSheet.create({
    container: {
        flex: 1
    }
})
export default ChefActiveBookingTab
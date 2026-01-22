// app/(tabs)/guest-chefs.tsx
import React, { useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, TextInput } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import UserActiveAds from "@/components/tabs/UserActiveAds";
import Colors from "@/constants/Colors";
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import ReusableButton from "@/components/buttons/ReusableButton";
import BookingModal from "@/components/BookingModal";

export default function PaymentScreen() {
    const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
        "active"
    );
    const { id, chefPic } = useLocalSearchParams();
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([]);
    const [onproceedToPay,setOnProceedToPay] = useState(false)

    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const [selectedDate, setSelectectedDate] = useState('');

    const checkAvailability = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/chef/${id}`)

            console.log({ seeRes: res })

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Chef is available!'
                // });
                // setChefInfo(res?.data?.payload)
                setLoading(false);
                setOnProceedToPay(true)
            } else {

                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef information'
                });
                setAds([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef information'
            });
            setAds([])
        }
    }
    return (
        <>
        <View style={styles.container}>
            
            <ReusableButton loading={loading} onPress={checkAvailability} style={{ marginTop: 40, margin: 10, borderRadius: 5,backgroundColor:'#4FB472' }} title="Pay with paystack" />
            <ReusableButton onPress={checkAvailability} style={{ marginTop: 10, margin: 10, borderRadius: 5 }} title="Request Invoice" />
        </View>
        
        {/* <BookingModal chefId={chefId} date={selectedDate} visible={onproceedToPay} onClose={()=>setOnProceedToPay(false)}/> */}
        </>
        
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
});
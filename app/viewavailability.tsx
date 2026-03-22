// app/(tabs)/guest-chefs.tsx
import React, { useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, TextInput } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import Colors from "@/constants/Colors";
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import ReusableButton from "@/components/buttons/ReusableButton";
import BookingModal from "@/components/BookingModal";
import BodyText from "@/components/typography/BodyText";

export default function ViewAvailabilityScreen() {
    const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
        "active"
    );
    const { chefId, chefPic } = useLocalSearchParams();
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([]);
    const [onproceedToPay, setOnProceedToPay] = useState(false)

    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const [selectedDates, setSelectedDates] = useState({
        startDate: '',
        endDate: '',
    });

    const checkAvailability = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.post(`/user/checkChefavailability`, {
                "chefId": chefId,
                "startDate": selectedDates.startDate,
                "endDate": selectedDates.endDate,
            })

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

                console.log({ seeAfter: res?.data?.message })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error!',
                    text2: `${res?.data?.message}`
                });
                setAds([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: error?.message
            });
            setAds([])
        }
    }

    const [markedDates, setMarkedDates] = useState({});

    const handleDatePress = (day: any) => {
        const { startDate, endDate } = selectedDates;
        const date = day.dateString;

        // If no start date OR a full range already exists, start a fresh selection
        if (!startDate || (startDate && endDate)) {
            setSelectedDates({ startDate: date, endDate: '' });
            setMarkedDates({
                [date]: { selected: true, startingDay: true, endingDay: true, color: 'blue' },
            });
            return;
        }

        // If start date exists but no end date yet
        if (!endDate) {
            // user tapped the same date -> select single-day range
            if (date === startDate) {
                setSelectedDates({ startDate: date, endDate: date });
                setMarkedDates({ [date]: { selected: true, startingDay: true, endingDay: true, color: 'blue' } });
                return;
            }

            // tapped a later date -> set end date and mark the range
            if (date > startDate) {
                const newMarkedDates: any = {};
                let currentDate = new Date(startDate);
                const end = new Date(date);
                while (currentDate <= end) {
                    const key = currentDate.toISOString().split('T')[0];
                    newMarkedDates[key] = { selected: true, color: 'blue', startingDay: key === startDate, endingDay: key === date };
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                setSelectedDates({ startDate, endDate: date });
                setMarkedDates(newMarkedDates);
                return;
            }

            // tapped an earlier date -> treat that as new start date
            if (date < startDate) {
                setSelectedDates({ startDate: date, endDate: '' });
                setMarkedDates({ [date]: { selected: true, startingDay: true, color: 'blue' } });
                return;
            }
        }
    };

    return (
        <>
            <View style={styles.container}>
                <Calendar
                    current={new Date().toString()}
                    minDate={new Date().toString()}
                    onDayPress={handleDatePress}
                    markedDates={markedDates}
                    markingType={'period'}
                />
                <View style={{ marginTop: 30, padding: '3%' }}>
                    <BodyText text={`Start Date: ${selectedDates.startDate}`} />
                    <BodyText text={`End Date: ${selectedDates.endDate}`} />
                </View>

                <ReusableButton loading={loading} disabled={!selectedDates.endDate} onPress={checkAvailability} style={{ marginTop: 40, margin: 10, borderRadius: 5 }} title="Check availability" />
            </View>

            <BookingModal startDate={selectedDates.startDate} endDate={selectedDates.endDate} chefId={chefId} date={selectedDates.startDate} visible={onproceedToPay} onClose={() => setOnProceedToPay(false)} />
        </>

    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: '3%' },
});
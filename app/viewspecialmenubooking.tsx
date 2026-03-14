// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useRef, useState } from "react";
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
import BodyText from "@/components/typography/BodyText";
import ReusableCard from "@/components/cards/ReusableCard";
import { convertToThousand } from "@/helpers/utils";
import FormInput from "@/components/FormInput";
import { Formik } from "formik";
import PaystackBookingModal from "@/components/PaystackBookingModal";

export default function ViewSpecialMenuAvailabilityBookingScreen() {
    const { chefId, chefPic } = useLocalSearchParams();
    const userProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([]);
    const [onproceedToPay, setOnProceedToPay] = useState(false)

    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [menuData, setMenuData] = useState<any>();
    const { id } = useLocalSearchParams();

    const [selectedDates, setSelectedDates] = useState({
        startDate: '',
        endDate: '',
    });

    const specialMenuPayload = {
        clientId: userProfile.id,
        specialMenuId: id,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
        bookingFeeAmount: menuData?.price
    }


    const fetchSpecialMenuDetails = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/specialmenu/${id}`)
            console.log({ seeRes: res?.data?.payload })
            if (res?.data?.success) {
                setMenuData(res?.data?.payload)
                setLoading(false)
            } else {
                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Unable to fetch Menu details',
                    text2: res?.data?.message || 'Something went wrong!',
                });
            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Network error',
                text2: error?.response?.message || 'Error fetching chefs',
            });
        }
    }

    useEffect(() => {
        fetchSpecialMenuDetails()
    }, [])

    const [markedDates, setMarkedDates] = useState({});

    const handleDatePress = (day: any) => {
        const { startDate, endDate } = selectedDates;

        if (!startDate) {
            // Set the start date
            setSelectedDates({ startDate: day.dateString, endDate: '' });
            setMarkedDates({
                [day.dateString]: { selected: true, startingDay: true, color: 'blue' },
            });
        } else if (!endDate && day.dateString > startDate) {
            // Set the end date
            setSelectedDates({ startDate, endDate: day.dateString });

            // Mark the date range
            const newMarkedDates: any = {};
            let currentDate = new Date(startDate);
            while (currentDate <= new Date(day.dateString)) {
                newMarkedDates[currentDate.toISOString().split('T')[0]] = { selected: true, color: 'blue' };
                currentDate.setDate(currentDate.getDate() + 1);
            }

            setMarkedDates(newMarkedDates);
        } else if (day.dateString < startDate) {
            // Reset if user selects a date before the start date
            setSelectedDates({ startDate: day.dateString, endDate: '' });
            setMarkedDates({
                [day.dateString]: { selected: true, startingDay: true, color: 'blue' },
            });
        }
    };

    return (
        <>
            <ScrollView style={styles.container}>
                <Formik
                    initialValues={{
                        customerId: "",
                        customerName: "",
                        orderAmount: "",
                        orderType: "",
                        fullName: "",
                        gender: "",
                        phoneNumber: "",
                        birthDate: "",
                        maritalStatus: "",
                    }}
                    onSubmit={() => console.log('')}
                >
                    {({ handleSubmit }) => (<>
                        <ReusableCard>
                            <View>
                                <SectionText text="Title" />
                                <BodyText text={menuData?.title} />

                                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 15 }}>
                                    <SectionText text="No of guests" />
                                    <BodyText text="10" />
                                </View>

                                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 15, alignItems: 'center' }}>
                                    <SectionText text="Price" />
                                    <BodyText text={convertToThousand(menuData?.price)} />
                                </View>

                                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', marginTop: 15, alignItems: 'center' }}>
                                    <SectionText text="No of Dish" />
                                    <BodyText text={'2'} />
                                </View>
                            </View>

                        </ReusableCard>

                        <ReusableCard>
                            <View>
                                <FormInput
                                    type="textarea"
                                    id="fullName"
                                    label="Special note"
                                    placeholder="Full name"
                                />
                            </View>

                        </ReusableCard>
                        <ReusableCard>
                            <SectionText textStyle={{ margin: 5 }} text="Select date of event" />
                            <Calendar
                                current={new Date().toString()}
                                minDate={new Date().toString()}
                                onDayPress={handleDatePress}
                                markedDates={markedDates}
                                markingType={'period'}
                            />
                            <ReusableButton
                                loading={loading}
                                disabled={!selectedDates.endDate}
                                onPress={() =>
                                    router.push({
                                        pathname: "/paystackscreen",
                                        params: {
                                            clientId: String(userProfile?.id),
                                            specialMenuId: String(id),
                                            startDate: String(selectedDates.startDate),
                                            endDate: String(selectedDates.endDate),
                                            bookingFeeAmount: String(menuData?.price),
                                        },
                                    })
                                }
                                style={{ marginTop: 40, margin: 5, borderRadius: 5 }}
                                title="Pay With Paystack"
                            />

                        </ReusableCard>

                    </>)}




                </Formik>
            </ScrollView>

            {/* <PaystackBookingModal chefId={chefId} date={selectedDates.startDate} visible={onproceedToPay} onClose={() => setOnProceedToPay(false)} /> */}
        </>

    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: '3%' },
});
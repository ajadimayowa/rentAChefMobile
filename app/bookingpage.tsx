// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, TextInput, Image, RefreshControl } from "react-native";
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
import { IChef } from "@/interfaces/chef";
import BodyText from "@/components/typography/BodyText";
import { ActivityIndicator, RadioButton } from 'react-native-paper';
import { convertToThousand } from "@/helpers/utils";
import ReusableCard from "@/components/cards/ReusableCard";
import FormInput from "@/components/FormInput";
import { Formik } from "formik";

export default function BookingScreen() {
    const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
        "active"
    );
    const { id, startDate, endDate } = useLocalSearchParams();
    const userProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([]);
    const [onproceedToPay, setOnProceedToPay] = useState(false)

    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const [loadingPricing, setLoadingPricing] = useState(false);
    const dispatch = useDispatch();

    const [selectedService, setSelectedService] = useState<string>(''); // Track the selected service
    const [serviceSelected, setServiceSelected] = useState<any>(); // Track the selected service
    const [selectedServicePrice, setSelectedServicePrice] = useState<any[]>([]); // Track the selected service

    const handleRadioChange = (serviceName: any) => {
        setSelectedService(serviceName?.serviceId?.name) // Update the selected service
        setServiceSelected(serviceName);
        fetchSelectedServicePricingCharges(serviceName?.serviceId?.id);
    };

    const [chefInfo, setChefInfo] = useState<IChef | any>();
    const [chefServices, setChefServices] = useState<any[]>([]);

    const [selectedDate, setSelectectedDate] = useState('');

    // Inside the `BookingScreen` component
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [selectedDates, setSelectedDates] = useState({
        startDate: '',
        endDate: '',
    });

    const specialMenuPayload = {
        clientId: userProfile.id,
        chefId: chefInfo?.chef?.id,
        startDate,
        endDate,
        serviceId: selectedServicePrice[0]?.serviceId?.id,
        categoryId: selectedServicePrice[0]?.chefCategoryId?.id,
        bookingFeeAmount: selectedServicePrice[0]?.price,
        totalAmount: selectedServicePrice[0]?.price,
    }

    // const handleServiceChange = (serviceName: string) => {
    //     setSelectedServices(prevState => {
    //         if (prevState.includes(serviceName)) {
    //             return prevState.filter(service => service !== serviceName);
    //         } else {
    //             return [...prevState, serviceName];
    //         }
    //     });
    // };

    


    // const filteredServicesWithJuniorChef = chefInfo?.servicesOffered.filter((service: any) =>
    //     service.services.some((s: any) => s.title === 'Junior Chef')
    // );


    const fetchChefInfo = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        setLoading(true)
        try {
            const res = await api.get(`/chef/${id}`)

            

            if (res?.data?.success) {
                setChefInfo(res?.data?.payload)
                setLoading(false)
            } else {

                
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef information'
                });
                setAds([])

            }

        } catch (error: any) {
            
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef information'
            });
            setAds([])
        }
    }

    const fetchServicesOfferedByChef = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        setLoading(true)
        try {
            const res = await api.get(`/chefServices/byAChef/${id}`)


            if (res?.data?.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Services fectched'
                });
                setChefServices(res?.data?.payload);
                setLoading(false)
            } else {

                
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef service'
                });
                setAds([])

            }

        } catch (error: any) {
            
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef service'
            });
            setAds([])
        }
    }

    const fetchSelectedServicePricingCharges = async (serviceId: string) => {
        setLoadingPricing(true);

        try {
            const res = await api.get(
                `/servicePricings?chefCategoryId=${chefInfo?.chef?.category?.id}&serviceId=${serviceId}`
            );

            if (res?.data?.success) {
                setSelectedServicePrice(res?.data?.data);
            }

            setLoadingPricing(false);
        } catch (error) {
            setLoadingPricing(false);
            Toast.show({
                type: "error",
                text1: "Error fetching service pricing",
            });
        }
    };

    useEffect(() => {
        fetchChefInfo();
        fetchServicesOfferedByChef()
    }, []);

    // useEffect(()=>{()=>{
    //     fetchSelectedServicePricingCharges()
    // }},[selectedService])
    return (
        <>
            <ScrollView
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchChefInfo} />
            }
             style={styles.container}>
                <Formik
                initialValues={{clientNote:""}}
                onSubmit={() => {}}
                >
                    {
({values})=>(
    <>
    <Image style={{ width: '100%', height: 250 }} source={
                    chefInfo?.chef?.profilePic
                        ? { uri: chefInfo?.chef?.profilePic }
                        : require('../assets/images/manavatar.png')
                } />
                <View style={styles.calendarcard}>
                    <SectionText textStyle={{ marginTop: 3 }} text="Name" />
                    <BodyText text={`${chefInfo?.chef?.name}`} />

                    <SectionText textStyle={{}} text="Chef Category" />
                    <BodyText text={`${chefInfo?.chef?.category?.name}`} />

                    <SectionText textStyle={{}} text="Specialties" />
                    <View >
                        {
                            chefInfo?.chef?.specialties.map((spec: any, index: number) => (<View key={index}><BodyText text={`${spec}`} /></View>))
                        }
                    </View>

                    <SectionText textStyle={{}} text="Select Service" />

                    {chefServices.map((service, index) => (
                        <View
                            key={index}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
                        >
                            <RadioButton.Android
                                value={service?.serviceId?.name}
                                status={
                                    selectedService === service?.serviceId?.name ? "checked" : "unchecked"
                                }
                                onPress={() => handleRadioChange(service)}
                                color="#ff733b"
                                uncheckedColor="#000000ff"
                            />

                            <Text style={{ marginLeft: 10 }}>
                                {service?.serviceId?.name}
                            </Text>
                        </View>
                    ))}


                </View>

                <View style={{ padding: '4%' }}>
                    <SectionText textStyle={{ marginTop: 3 }} text="Cost calculation" />

                    {loadingPricing ? (
                        <ActivityIndicator />
                    ) : selectedServicePrice ? (
                        <BodyText text={`Price to pay : ${convertToThousand(selectedServicePrice[0]?.price)}`} />
                    ) : (
                        <BodyText text="Select a service to see price" />
                    )}
                </View>

                <ReusableCard>
                    <View>
                        <FormInput
                            type="textarea"
                            id="clientNote"
                            label="Special note"
                            placeholder="Special note to admin and chef"
                        />
                    </View>

                </ReusableCard>





                <ReusableButton loading={loading} disabled={!endDate || !selectedServicePrice[0]?.price} onPress={() => router.push({ pathname: './paystackscreenchef', params: {...specialMenuPayload, clientNote: values.clientNote } })} style={{ marginTop: 40, margin: 5, borderRadius: 5 }} title="Pay With Paystack" />
                <ReusableButton loading={loading} disabled={!endDate} style={{ margin: 5, borderRadius: 5, borderWidth: 0.2, borderColor: '#000', backgroundColor: '#fff' }} textStyle={{ color: '#000' }} title="Request Invoice" />

                <View style={{ padding: '4%' }}>
                </View>
    </>
)
                    }
                
</Formik>
            </ScrollView>

            {/* <BookingModal chefId={chefId} date={selectedDate} visible={onproceedToPay} onClose={()=>setOnProceedToPay(false)}/> */}
        </>

    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: '2%' },
    calendarcard: {
        width: "100%",
        marginTop: "10@vs",
        marginBottom: "10@vs",
        gap: "10@s",
        flexWrap: "wrap",
        padding: "3%",
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
});
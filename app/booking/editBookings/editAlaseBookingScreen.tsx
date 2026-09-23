import FrameCard from "@/components/cards/FrameCard";
import IconWrapper from "@/components/cards/IconWrapper";
import { RootState } from "@/store";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useSelector } from "react-redux";
import cartIcon from "../../../assets/icons/cartIcon.png";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import PrimaryActionButton from "@/components/buttons/PrimaryActionButton";


export default function EditAlaseBookingScreen() {
    const profile = useSelector((state: RootState) => state.auth.bioData) as any;
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ bookingId: string, bookingName: string, bookingNumber: string }>();
    const [serviceDetails, setServiceDetails] = useState<any>(null);
    const requestedServiceName = params.bookingName;

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Update Booking Details`,
            headerShown: true,
            headerStyle: styles.headerStyle,
            headerTintColor: "#fff",
            headerTitleStyle: {
                fontWeight: "600",
                fontFamily: "titleFont",
            },
            headerLeft: () => <TouchableOpacity onPress={() => navigation.goBack()}><Entypo name="chevron-left" size={24} color="white" /></TouchableOpacity>
        });
    }, [navigation, requestedServiceName]);

    return (
        <View style={styles.container}>
            <FrameCard style={styles.titleCard}>
                <View style={{ position: "absolute", top: 10, right: 10 }}>
                </View>

                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cartIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={params.bookingNumber} />
                <BodyText text='' />

            </FrameCard>
            <ScrollView>
                <FrameCard style={styles.detailCard}>
                
                <SectionText text='Summary' />

            </FrameCard>

             <FrameCard style={styles.detailCard}>
                
                <SectionText text='Payment' />

            </FrameCard>

            <FrameCard style={styles.detailCard}>
                
                <SectionText text='Protein Options' />

            </FrameCard>

            <FrameCard style={styles.detailCard}>
                
                <SectionText text='Admin' />

            </FrameCard>
            </ScrollView>
        </View>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F5',
        padding: "10@ms",
    },
    headerStyle: {
        backgroundColor: "#000000",
    },
    titleCard: {
        alignItems: "center",
        justifyContent: "center",
    },
    detailCard: {
    },
})
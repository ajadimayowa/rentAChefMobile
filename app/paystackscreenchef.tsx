// app/(tabs)/guest-chefs.tsx
import React, { useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import Colors from "@/constants/Colors";
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams,useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import ReusableButton from "@/components/buttons/ReusableButton";
import BookingModal from "@/components/BookingModal";
import WebView from "react-native-webview";
import { ActivityIndicator } from "react-native-paper";

export default function PayStackScreenChef() {
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
    "active"
  );
  const {
        clientId,
        chefId,
        clientNote,
        serviceId,
        categoryId,
        totalAmount,
        startDate,
        endDate,
        bookingFeeAmount
    } = useLocalSearchParams();
  const localProfile = useSelector((user: RootState) => user.auth.bioData);
  const [ads, setAds] = useState<any[]>([]);
  const [onproceedToPay, setOnProceedToPay] = useState(false)

  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const router = useRouter()
  const inputs = useRef<TextInput[]>([]);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [verified, setVerified] = useState(false);

  const [selectedDate, setSelectectedDate] = useState('');

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const userProfile = useSelector((user: RootState) => user.auth.bioData);

  const startPayment = async () => {
    setLoading(true)
    try {
      const res = await api.post("/payment/initialize-payment", {
        email: userProfile.email,
        amount: bookingFeeAmount,
        callback_url: 'https://rent-a-chef-portal.vercel.app/payment-succesful'
      });

      console.log({ seeResp: res.data?.data })

      if (res.data) {
        setLoading(false);
        setPaymentUrl(res.data?.data?.authorization_url);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    console.log({seeVerifRef:reference})
    try {
      const res = await api.post(`/payment/verify/${reference}`);
      const { data } = res;

      if (data.data.status === "success") {
        completeBooking(reference)
        
      } else {
        Alert.alert("Payment verification failed");
        router.back()
      }
    } catch (err) {
      Alert.alert("Verification error");
      router.back()
    }
  };

  const completeBooking = async (ref: any) => {

    const bookingPayload  = {
        clientId,
        clientNote,
        startDate,
        endDate,
        chefId,
        serviceId,
        categoryId,
        bookingFeeAmount,
        totalAmount,
        paymentChannel: "paystack",
        paymentReference:ref
    }
    setLoading(true);
    try {
      console.log({sendingForChefBok:bookingPayload});
      const res = await api.post(`/booking/create`, bookingPayload);
      

      if (res?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Booking completed",
        });
        router.replace('/(dashboard)/bookings')
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to create booking.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network error.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {!paymentUrl ? (
          <TouchableOpacity style={styles.button} onPress={startPayment}>
            {
              loading ? <ActivityIndicator /> :
                <Text style={styles.buttonText}>{bookingFeeAmount}</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={{ height: 500 }}>
            <WebView
              source={{ uri: paymentUrl }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              originWhitelist={["*"]}
              onNavigationStateChange={(navState) => {
  if (navState.url.includes("reference=") && !verified) {
    setVerified(true);

    const reference = navState.url.split("reference=")[1];
    verifyPayment(reference);
  }
}}
            />
          </View>
        )}

        {!paymentUrl && <ReusableButton loading={loading} onPress={startPayment} style={{ marginTop: 40, margin: 10, borderRadius: 5, backgroundColor: '#4FB472' }} title={`Pay ${bookingFeeAmount}`}/>}
        {/* <ReusableButton loading={loading} onPress={()=>router.back()} style={{ marginTop: 40, margin: 10, borderRadius: 5, backgroundColor: '#4FB472' }} title="Cancel" /> */}

      </View>

      {/* <BookingModal chefId={chefId} date={selectedDate} visible={onproceedToPay} onClose={()=>setOnProceedToPay(false)}/> */}
    </>

  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  calendarcard: {
    width: "100%",
    marginTop: "10@vs",
    marginBottom: "10@vs",
    gap: "10@s",
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
  button: {
    width: "100%",
    padding: "12@ms",
    borderRadius: "8@ms",
    alignItems: "center",
    marginVertical: "8@ms",
  },
  buttonText: {
    color: "#fff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});
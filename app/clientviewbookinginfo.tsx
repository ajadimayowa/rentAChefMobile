// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl, Modal, ActivityIndicator } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import { SafeAreaView } from "react-native-safe-area-context";
import ReusableCard from "@/components/cards/ReusableCard";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SecureStorage from "@/store/secureStore";
import BodyText from "@/components/typography/BodyText";
import api from "@/services/apiConfig";
import Constants from 'expo-constants';
import { IUser } from "@/interfaces/user";
import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import ReusableButton from "@/components/buttons/ReusableButton";
import RateChefModal from "@/components/modals/menus/RateChefModal";
import AuthModal from "@/components/AuthModal";
import ChangeProfilePicModal from "@/components/modals/profile/ChangeProfilePicModal";
import UpdatePersonalInfoModal from "@/components/modals/profile/UpdatePersonalInfoModal";
import UpdateHealthInfoModal from "@/components/modals/profile/UpdateHealthInfoModal";
import UpdateAddressInfoModal from "@/components/modals/profile/UpdateAddressInfoModal";
import UpdateNOKInfoModal from "@/components/modals/profile/UpdateNOKInfoModal";
import { Booking } from "@/interfaces/booking";
import moment from "moment";
import { convertToThousand } from "@/helpers/utils";

export default function ClientViewBookingInfo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking>();
  const [showWebView, setShowWebView] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [rateChefModal, setRateChefModal] = useState(false);

  const [updatePicModal, setUpdatePicModal] = useState(false);
  const [updatePersonalInfoModal, setUpdatePersonalInfoModal] = useState(false);
  const [updateHealthInfoModal, setUpdateHealthInfoModal] = useState(false);
  const [updateAddressInfoModal, setUpdateAddressInfoModal] = useState(false);
  const [updateNokModal, setUpdateNokModal] = useState(false);



  const fetchBooking = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get(`/booking/${id}`)
      // console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setBooking(res?.data?.payload)
        setLoading(false)
      } else {
        console.log({ seeAfter: res })
        setLoading(false)
        Toast.show({
          type: 'error',
          text1: 'Network error',
          text2: res?.data?.message || 'Something went wrong!',
        });
      }

    } catch (error: any) {
      console.log({ seeErrorBreak: error })
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Error fetching chefs',
      });
    }
  }

  useEffect(() => {
    fetchBooking()
  }, [])

  const initPaystackAndOpen = async () => {
    if (!booking?.procurementId) return Toast.show({ type: 'error', text1: 'No procurement to pay' });
    try {
      setInitializing(true);
      const amount = booking.procurementId.totalCost || 0;
      const callbackUrl = `${Constants.expoConfig?.extra?.apiUrl}/paystack/callback`;
      const res = await api.post('/payment/initialize-payment', { email: userProfile.email, amount, callback_url: callbackUrl });
      const auth = res?.data?.data?.authorization_url;
      if (!auth) {
        Toast.show({ type: 'error', text1: 'Failed to initialize payment' });
        setInitializing(false);
        return;
      }
      setAuthUrl(auth);
      setShowWebView(true);
    } catch (err: any) {
      console.log('init payment error', err);
      Toast.show({ type: 'error', text1: err?.response?.data?.message || err.message || 'Failed to init payment' });
    } finally {
      setInitializing(false);
    }
  }

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    if (!url) return;

    // Paystack redirects to callback_url with ?reference=...
    const hasRef = url.includes('reference=');
    if (hasRef) {
      // extract reference
      const match = url.match(/[?&]reference=([^&]+)/);
      const reference = match ? match[1] : null;
      setShowWebView(false);
      setAuthUrl(null);
      if (!reference) {
        Toast.show({ type: 'error', text1: 'Payment reference not found' });
        return;
      }

      try {
        // verify payment via backend
        const verifyRes = await api.post(`/payment/verify/${reference}`);
        const status = verifyRes?.data?.data?.status || verifyRes?.data?.status || (verifyRes?.data?.message ? 'success' : null);
        // If verification successful, tell backend to mark procurement paid
        if (status === 'success' || verifyRes?.data?.status === 'success' || verifyRes?.data?.data?.status === 'success') {
          const procurementId = booking?.procurementId?.id || booking?.procurementId?._id || booking?.procurementId;
          if (!procurementId) {
            Toast.show({ type: 'error', text1: 'Procurement not found' });
            return;
          }

          await api.post(`/procurement/${procurementId}/pay`, { paymentChannel: 'paystack', paymentReference: reference });
          Toast.show({ type: 'success', text1: 'Procurement payment successful' });
          fetchBooking();
        } else {
          Toast.show({ type: 'error', text1: 'Payment verification failed' });
        }
      } catch (err: any) {
        console.error('verify/payment error', err);
        Toast.show({ type: 'error', text1: err?.response?.data?.message || err.message || 'Payment verification error' });
      }
    }
  }

  const handleLogout = async () => {
    await persistor.purge();
    router.replace('/authscreen')

  }
  return (
    <>
        <ScrollView refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBooking} />
        } style={style.container}>

          <View style={[style.card]}>
            <View style={style.rowSection}>
              <SectionText text={booking?.serviceId?.name ??booking?.specialMenuId?.title??''} />
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
              <BodyText text={booking?.procurementPaid ? 'Yes' : 'No'} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Amount'} />
              <BodyText text={convertToThousand(booking?.bookingFeeAmount)} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Status'} />
              <BodyText text={booking?.status??''} />
            </View>
          </View>


          {
            booking?.procurementId &&
            <View style={[style.card,{backgroundColor:'#e8ffeeff'}]}>
              {
                booking?.procurementId?.items?.map((item:any, index:number)=>(
                  <View key={index} style={style.rowSection}>
                    <BodyText text={item?.title} />
                    <BodyText text={`${convertToThousand(item?.amount)}`} />
                  </View>
                ))
              }
            

            <View style={style.rowSection}>
                    <SectionText text={'Total'} />
                    <SectionText text={convertToThousand(booking?.procurementId?.totalCost)} />
                  </View>
          </View>}

{
  <ReusableButton
    loading={initializing || loading}
    style={{ marginTop: 40, margin: 10, borderRadius: 5}}
    title={`Pay Procurement`}
    onPress={initPaystackAndOpen}
  />
}

{ booking?.bookingType === 'chef' && (
  <ReusableButton
    onPress={async () => {
      const token = await SecureStorage.getItem('userToken');
      setRateChefModal(true);
    }}
    textStyle={{ color: '#E39325' }}
    style={{ borderRadius: 5, backgroundColor: '#ffffffff', borderColor: '#E39325', borderWidth: 1, marginTop: 10 }}
    title="Rate Chef"
  />
)}

<RateChefModal
  visible={rateChefModal}
  onClose={() => { setRateChefModal(false); }}
  chefId={(booking?.chefId as any)?.id || (booking?.chefId as any)?._id || (booking?.chefId as any)}
  bookingId={booking?.id || (booking as any)?._id}
/> 

      <Modal visible={showWebView} animationType="slide">
        <View style={{ flex: 1 }}>
          {authUrl ? (
            <WebView
              source={{ uri: authUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
              renderLoading={() => <ActivityIndicator size="large" style={{ flex: 1 }} />}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <TouchableOpacity onPress={() => { setShowWebView(false); setAuthUrl(null); }} style={{ position: 'absolute', top: 40, right: 20 }}>
            <Text style={{ color: '#fff', backgroundColor: '#000', padding: 8, borderRadius: 8 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>


        </ScrollView>
    </>
  );
}

const style = ScaledSheet.create({
  frame: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1,padding:'3%' },
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
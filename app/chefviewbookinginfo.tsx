// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl } from "react-native";
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
import { IUser } from "@/interfaces/user";
import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import ReusableButton from "@/components/buttons/ReusableButton";
import AuthModal from "@/components/AuthModal";
import ChangeProfilePicModal from "@/components/modals/profile/ChangeProfilePicModal";
import UpdatePersonalInfoModal from "@/components/modals/profile/UpdatePersonalInfoModal";
import UpdateHealthInfoModal from "@/components/modals/profile/UpdateHealthInfoModal";
import UpdateAddressInfoModal from "@/components/modals/profile/UpdateAddressInfoModal";
import UpdateNOKInfoModal from "@/components/modals/profile/UpdateNOKInfoModal";
import { Booking } from "@/interfaces/booking";
import moment from "moment";
import { convertToThousand } from "@/helpers/utils";

export default function ChefViewBookingInfo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking>();

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


          <View style={[style.card]}>
            <View style={style.rowSection}>
              <SectionText text={'Client Details'} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Name'} />
              <BodyText text={booking?.clientId?.fullName ?? ''} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Phone'} />
              <BodyText text={booking?.clientId?.phone ?? ''} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Address'} />
              <BodyText text={booking?.clientId?.location?.home ?? '-'} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Health Details'} />
              <BodyText text={booking?.clientId?.healthInformation?.healthDetails ?? '-'} />
            </View>

            <View style={style.rowSection}>
              <BodyText text={'Client Note'} />
              <BodyText text={booking?.clientNote ?? ''} />
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
  !booking?.procurementId &&
  <ReusableButton loading={loading} style={{ marginTop: 40, margin: 10, borderRadius: 5}} title={`Add Procurement`} />}


        </ScrollView>
      <ChangeProfilePicModal visible={updatePicModal} onClose={() => setUpdatePicModal(false)} />
      <UpdatePersonalInfoModal visible={updatePersonalInfoModal} onClose={() => setUpdatePersonalInfoModal(false)} />
      <UpdateHealthInfoModal visible={updateHealthInfoModal} onClose={() => setUpdateHealthInfoModal(false)} />
      <UpdateAddressInfoModal visible={updateAddressInfoModal} onClose={() => setUpdateAddressInfoModal(false)} />
      <UpdateNOKInfoModal visible={updateNokModal} onClose={() => setUpdateNokModal(false)} />
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
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
import { useRouter } from "expo-router";
import SecureStorage from "@/store/secureStore";
import BodyText from "@/components/typography/BodyText";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";
import { Entypo, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function GuestChefsScreen() {
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IUser>();



  const fetchUserProfile = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get(`/user/${userProfile.id}`)
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setUserData(res?.data?.payload)
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
    fetchUserProfile()
  }, [router])

  const handleLogout = async () => {
    await SecureStorage.removeItem("userToken");
    await persistor.purge();
    router.replace('/authscreen')

  }
  return (
    <SafeAreaView style={styles.frame}>
      <ScrollView refreshControl={
                          <RefreshControl refreshing={loading} onRefresh={fetchUserProfile} />
                        } style={styles.container}>
        <View style={{ alignItems: 'center', width: '100%' }}>
          {userData?.profilePic ? <Image source={{uri:userData?.profilePic as any}} style={{ width: '100%', height: 250}} /> : <View>{userData?.gender == 'm' ? <Image source={require('../../assets/images/manavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} /> : <Image source={require('../../assets/images/womanavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} />}</View>}
        </View>
        <ReusableCard>
          <View>
            <SectionText text="Name" />
            <BodyText text={userProfile?.fullName} />

            <SectionText textStyle={{ marginTop: 5 }} text="Gender" />
            <BodyText text={userData?.gender == 'm' ? 'Male' : 'Female'} />

            <SectionText textStyle={{ marginTop: 5 }} text="Contact" />
            <BodyText text={`0${userData?.phone} | ${userData?.email}`} />

            {/* <SectionText textStyle={{ marginTop: 5 }} text="Health information" />
            <BodyText text={userProfile?.healthInfo ?? '-'} />

            <SectionText textStyle={{ marginTop: 5 }} text="Allergies" />
            <BodyText text={userProfile?.allergies ?? '-'} /> */}
          </View>

          <TouchableOpacity onPress={()=>router.push({pathname:`/viewprofile`,params:{id:userProfile.id}})} style={{width:'100%',flexDirection:'row', marginTop:30, justifyContent:'space-between', alignItems:'center'}}>
            <BodyText textStyle={{color:'#52220aff'}} text={"See More"}/> 
            <FontAwesome5 color={'#52220aff'}  name="angle-right"/>
          </TouchableOpacity>

        </ReusableCard>
        {/* <ReusableCard title="Subscriptions">

        </ReusableCard>

        <ReusableCard title="Payment Methods">

        </ReusableCard> */}

        <ReusableCard onPress={handleLogout} title="Logout">

        </ReusableCard>

        <View style={{width:'100%',marginTop:20, alignItems:'center'}}>
          <Entypo size={28} name="old-phone"/>
          <SectionText text="For complaints and manual booking"/>
          <BodyText text="+2348166467555"/>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>

        </ScrollView>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  frame: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    padding: '2%',
  },
});
// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl, Linking, Pressable } from "react-native";
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
import { IChef } from "@/interfaces/chef";

export default function ChefProfile() {
  const chefProfile = useSelector((user: RootState) => user.chef);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chefData, setChefData] = useState<IChef | any>();



  const fetchChefProfile = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get(`/chef/${chefProfile.chefData.id}`)
      
      if (res?.data?.success) {
        setChefData(res?.data?.payload)
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
    fetchChefProfile()
  }, [router])

  const openPPolicy = async () => {
      const url = "https://rentachefng.com/privacy-policy/";
  
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open WhatsApp link");
      }
    };

    const openTOS = async () => {
      const url = "https://rentachefng.com/terms-of-service/";
  
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open WhatsApp link");
      }
    };

    const openFAQ = async () => {
      const url = "https://rentachefng.com/faq/";
  
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open WhatsApp link");
      }
    };

  const handleLogout = async () => {
    await SecureStorage.removeItem("userToken");
    await persistor.purge();
    router.replace('/authscreen')

  }
  return (
    <SafeAreaView style={styles.frame}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchChefProfile} />
      } style={styles.container}>
        <View style={{ alignItems: 'center', width: '100%' }}>
          {chefData?.chef?.profilePic ? <Image source={{ uri: chefData?.chef?.profilePic as any }} style={{ backgroundColor: "#ffffffff", height: 200, width: 200, borderRadius: 200, overflow: 'hidden' }} /> : <View>{chefData?.chef?.gender == 'm' ? <Image source={require('../../assets/images/manavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} /> : <Image source={require('../../assets/images/womanavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} />}</View>}
          <BodyText textStyle={{ marginTop: 10,color:'#ff6600ff' }}  text={`${chefData?.chef?.category?.name}`} />
          <SectionText text={chefData?.chef?.name} />
           
          <BodyText text={`${chefData?.chef?.email}`} />
         
        </View>

       

        <ReusableCard  title="Personal Information">

        </ReusableCard>

        <ReusableCard  title="Notifications">

        </ReusableCard>

        <View style={{ padding: 20 }}>
          <SectionText textStyle={{ marginTop: 10 }} text="Help & Support" />

        </View>

        <ReusableCard onPress={openPPolicy} title="Privacy Policy">

        </ReusableCard>

        <ReusableCard onPress={openTOS} title="Terms of Service">

        </ReusableCard>

        <ReusableCard onPress={openFAQ} title="FAQ & Help">

        </ReusableCard>

        <ReusableCard titleStyle={{ color: "#ff6464ff" }} style={{ backgroundColor: "#ffffffff", borderWidth: 1, borderColor: "#ff6464ff" }} onPress={handleLogout} title="Logout">

        </ReusableCard>

        <View style={{ width: '100%', marginTop: 20, alignItems: 'center' }}>
          <Entypo size={28} name="old-phone" />
          <SectionText text="To report client misconduct" />
          <BodyText text="+2348166467555" />
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
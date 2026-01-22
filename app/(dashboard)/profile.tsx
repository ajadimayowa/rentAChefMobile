// app/(tabs)/guest-chefs.tsx
import React from "react";
import { View, ScrollView, Image,Text } from "react-native";
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

export default function GuestChefsScreen() {
  const userProfile = useSelector((state:RootState)=>state.auth.bioData);
  const dispatch = useDispatch();
  const router = useRouter()

  const handleLogout = async()=>{
   await persistor.purge();
    router.replace('/authscreen')

  }
  return (
    <SafeAreaView style={styles.frame}>
      <View style={styles.container}>
        <View style={{alignItems:'center', width:'100%'}}>
        {userProfile?.profilePic?<Image source={userProfile?.profilePic as any} style={{ width: 100, height: 100, borderRadius:100 }}/>:<View>{userProfile?.gender=='m'?<Image source={ require('../../assets/images/womanavatar.png')} style={{ width: 100, height: 100, borderRadius:100 }}/>:<Image source={ require('../../assets/images/manavatar.png')} style={{ width: 100, height: 100, borderRadius:100 }}/>}</View>}
        </View>
        <ReusableCard> 
          <View>
            <SectionText text="Name"/>
            <BodyText text={userProfile?.fullName}/>

            <SectionText textStyle={{marginTop:5}} text="Gender"/>
            <BodyText text={userProfile?.gender=='m'?'Male':'-'}/>
          </View>

      </ReusableCard>

        <ReusableCard title="Update profile"> 

      </ReusableCard>
      <ReusableCard title="Health Information"> 

      </ReusableCard>
      <ReusableCard title="Subscriptions"> 

      </ReusableCard>

      <ReusableCard title="Payment Methods"> 

      </ReusableCard>

      <ReusableCard onPress={handleLogout} title="Logout"> 

      </ReusableCard>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
      </ScrollView>

      </View>
      
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  frame: { flex: 1, backgroundColor: "#fff"},
  container: { 
    flex: 1,
    padding:'2%',
  },
});
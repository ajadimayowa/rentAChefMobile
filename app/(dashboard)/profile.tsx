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
import { RootState } from "@/store";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { logout } from "@/store/slices/authSlice";

export default function GuestChefsScreen() {
  const userProfile = useSelector((state:RootState)=>state.auth.userProfile?.biodata);
  const dispatch = useDispatch();
  const router = useRouter()

  const handleLogout = ()=>{
    dispatch(logout())
    router.replace('/');

  }
  return (
    <SafeAreaView style={styles.frame}>
      <View style={styles.container}>
        <View style={{alignItems:'center', width:'100%'}}>
        <Image source={require('../../assets/images/avatar.jpg')} style={{ width: 100, height: 100, borderRadius:100 }}/>
        <Text>{userProfile?.fullName}</Text>
        </View>
        <ReusableCard title="Prefference"> 

      </ReusableCard>
      <ReusableCard title="Settings"> 

      </ReusableCard>
      <ReusableCard title="Wallet"> 

      </ReusableCard>

      <ReusableCard onPress={()=>Toast.show({type:'success', text1:'Hello'})} title="Ping"> 

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
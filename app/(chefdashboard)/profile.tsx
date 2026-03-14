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
import SecureStorage from "@/store/secureStore";

export default function GuestChefsScreen() {
  const chefProfile = useSelector((state:RootState)=>state.chef.chefData);
  const dispatch = useDispatch();
  const router = useRouter()

  const handleLogout = async ()=>{
    await SecureStorage.removeItem('userToken');
    router.replace('/login');
  }
  return (
    <SafeAreaView style={styles.frame}>
      <View style={styles.container}>
        <View style={{alignItems:'center', width:'100%'}}>
        <Image source={require('../../assets/images/avatar.jpg')} style={{ width: 100, height: 100, borderRadius:100 }}/>
        <Text>{chefProfile?.name}</Text>
        </View>
      <ReusableCard title="Update Profile"> 

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
import { ScaledSheet } from "react-native-size-matters";
import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import SecureStorage from "@/store/secureStore";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogOut = async () => {
    dispatch(logout())
    await SecureStorage.removeItem('token');
    router.replace('/login')

  }
  return (
    <SafeAreaView style={{flex:1}}>
      <View style={{padding:20}}>
        <TouchableOpacity style={{alignItems:'center', backgroundColor:'#1A5745',padding:20, borderRadius:5}}  onPress={handleLogOut}>
          <Text style={{color:'#fff'}}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }

})
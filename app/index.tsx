import { ScaledSheet } from "react-native-size-matters";
import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/store/hooks";

export default function LandingScreen() {
  const staffProfile = useAppSelector((state) => state.auth.userProfile);
  const router = useRouter();

  const checkAuth = () => {
    if (!staffProfile?.biodata.fullName) {
      router.replace("/authscreen");
    } else {
      router.replace("/(dashboard)");
    }
  }

  useEffect(() => {
    setTimeout(() => {
      checkAuth();
    }, 3000)
  }, []);
  return (
    <View style={styles.container}>
      <View>
        <Image source={require('../assets/gif/rentLoader.gif')} style={{ width: 200, height: 200 }} />
      </View>
    </View>

  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff'
  }

})
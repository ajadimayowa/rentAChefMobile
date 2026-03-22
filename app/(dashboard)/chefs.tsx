// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView ,Text, RefreshControl} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import DishCard from "@/components/DishCard";
import PrimaryLoader from "@/components/Loader";
import { IChef, IChefList } from "@/interfaces/chef";
import { router } from "expo-router";

export default function ChefsScreen() {

  const [loading, setLoading] = useState(false);
    const [menus, setMenus] = useState<any[]>([]);
    const [chefs, setChefs] = useState<IChefList[]>([])

  const fetchChefs = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/chefs')
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setChefs(res?.data?.payload)
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
        text2: error?.response?.message || 'Invalid credentials',
      });
    }
  }

  useEffect(() => {
    fetchChefs()
  }, [])

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Our Professional Chefs"
        subtitle="Find the right chef for your event"
        showSearch
      />

      {
              loading && <PrimaryLoader />
            }

      {!loading&&
        <ScrollView refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchChefs} />
                  } contentContainerStyle={{ padding: 20 }}>

          {
            chefs.length > 0 ? chefs.map((chef:IChefList, index) => (
              <View key={index}>
                <ChefCard
                  chef={chef}
                />
              </View>
            ))
              :
              <View style={{ width: '100%', height: 200, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="chef-hat" size={48} style={{ margin: 10 }} color={Colors.primary.base} />
                <Text style={{ width: '100%', textAlign: 'center' }}>No Chefs At This Time</Text>
              </View>
          }
        </ScrollView>
      }
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
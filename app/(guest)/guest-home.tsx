// app/(tabs)/guest-home.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import DishCard from "@/components/DishCard";
import SectionText from "@/components/typography/SectionText";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "@/services/apiConfig";
import { router } from "expo-router";
import PrimaryLoader from "@/components/Loader";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { IChef } from "@/interfaces/chef";
import { IMenu, ISpecialMenu } from "@/interfaces/menu";

export default function GuestHomeScreen() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [chefs, setChefs] = useState<IChef[]>([])
  // console.log('okkkk')

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
        text1: 'Failed to fetch',
        text2: error?.response?.message || 'Invalid credentials',
      });
    }
  }

  const fetchMenu = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/specialmenu/menus')
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setMenus(res?.data?.payload)
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
    fetchMenu();
    fetchChefs();
  }, [])
  return (
    <View style={styles.container}>
      <HeaderBar showBack title="Welcome to Rent A Cheff" showSearch />

      {
        loading && <PrimaryLoader />
      }

      {!loading &&
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <SectionText text="Special Menu" textStyle={{ marginBottom: 15 }} />
           
          {
            menus.length > 0 ? <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}
              >{
                  menus.map((menu: ISpecialMenu, index) => (
                    <View key={index}>
                      <DishCard
                      menu={menu}
                      />

                    </View>
                  ))
                }

              </ScrollView>

            </>
              :
              <View style={{ width: '100%', height: 100, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
                <Ionicons color={Colors.primary.base} size={48} name="fast-food" style={{ margin: 10 }} />
                <Text style={{ width: '100%', textAlign: 'center' }}>No Menu At This Time</Text>
              </View>
          }

          <SectionText text="Featured chefs" textStyle={{ marginBottom: 5, marginTop: 20 }} />

          {
            chefs.length > 0 ? chefs.map((chef: any, index) => (
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
  sectionTitle: { fontSize: "16@s", marginVertical: "10@vs", fontFamily: 'titleFont' },
});
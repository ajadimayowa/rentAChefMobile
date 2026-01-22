// app/(tabs)/guest-home.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Pressable, RefreshControl } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import DishCard from "@/components/DishCard";
import SectionText from "@/components/typography/SectionText";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import PrimaryLoader from "@/components/Loader";
import { IMenu } from "@/interfaces/menu";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { IChef } from "@/interfaces/chef";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import HeaderBarUser from "@/components/HeaderBarUser";
import ReusableCard from "@/components/cards/ReusableCard";
import ReusableImageBGCard from "@/components/cards/ReusableImageBGCard";
import ReusableImgBGOverlayCard from "@/components/cards/ReusableImgBGOverlayCard";
import BodyText from "@/components/typography/BodyText";
import HeaderBarLoaction from "@/components/HeaderBarLoaction";
import { router } from "expo-router";

export default function GuestHomeScreen() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const userProfile = useSelector((user: RootState) => user.auth);
  const userLocation = useSelector((location: RootState) => location.location);

  const menuCategories = [
    {
      id: '1',
      title: 'Pastry',
      description: ''
    },
    {
      id: '2',
      title: 'Desert',
      description: ''
    },
    {
      id: '3',
      title: 'Breakfast',
      description: ''
    }
  ]
  // console.log('okkkk')

  const activities = [
    {
      id: '1',
      title: 'Completed',
      description: '',
      icon: 'checkbox'
    },
    {
      id: '2',
      title: 'Upcoming',
      description: '',
      icon: 'calendar-clear'
    },
    {
      id: '3',
      title: 'Perks',
      description: '',
      icon: 'fast-food'
    }
  ]

  const fetchChefs = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/chefs?limit=20')
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setChefs(res?.data?.payload?.reverse())
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

  const fetchMenu = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/menu/getMenus')
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

  const fetchCategories = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/category/categories')
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setCategories(res?.data?.payload)
        setLoading(false)
      } else {
        console.log({ seeAfter: res })
        setLoading(false)
        Toast.show({
          type: 'error',
          text1: 'Network error',
          text2: res?.data?.message || 'Unable to fetch categories',
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
    fetchCategories()
    fetchMenu();
    fetchChefs();

  }, [])
  return (
    <View style={styles.container}>
      {/* <HeaderBarUser subtitle="Welcome to rent a chef" title={`Hi ${userProfile?.bioData?.fullName?.split(" ")[0]}`} showSearch showBack={false} /> */}
      <HeaderBarLoaction profilePic={userProfile.bioData.profilePic} location={`${userLocation.userLocation},${userLocation.userState}`} fullName={`Hi ${userProfile?.bioData?.fullName}`} showSearch showBack={false} />

      {
        loading && <PrimaryLoader />
      }

      {!loading &&
        <ScrollView
        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={fetchChefs} />
                        } 
        contentContainerStyle={{ padding: 20 }}>
          <ReusableImgBGOverlayCard
            image={require('../../assets/images/pasta.png')}
            gradientText={'Enjoy Amazing Dishes'}
            description={`You don't have to break your bank to enjoy exquisite cuisines.`}
          />

          {/* <View style={{ width: '100%', padding: 20, flexDirection: 'row', marginTop: 10, gap: 20, justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => console.log('ok')}
              style={({ pressed }) => [
                styles.btncontainer,
                { backgroundColor: '#fff' },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={'checkbox-outline'} size={34} color={'#000'} />
              <Text style={[styles.text, { color: '#000' }]}>{'Completed'}</Text>
            </Pressable>
            <Pressable
              onPress={() => console.log('ok')}
              style={({ pressed }) => [
                styles.btncontainer,
                { backgroundColor: '#fff' },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={'calendar-clear-outline'} size={34} color={'#000'} />
              <Text style={[styles.text, { color: '#000' }]}>{'Upcoming'}</Text>
            </Pressable>
            <Pressable
              onPress={() => console.log('ok')}
              style={({ pressed }) => [
                styles.btncontainer,
                { backgroundColor: '#fff' },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={'fast-food-outline'} size={34} color={'#000'} />
              <Text style={[styles.text, { color: '#000' }]}>{'Perks'}</Text>
            </Pressable>
            
          </View> */}



<SectionText text="Available services" textStyle={{ marginBottom: 10, marginTop: 10, }} />
          <View style={{ width: '100%', marginBottom: 10, gap:10, flexDirection: 'row',flexWrap:'wrap',marginTop: 10,}}>
            {
              categories.map((cats, index) => (
                <Pressable
                  key={index}
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.catbtncontainer,
                    { backgroundColor: index==0?'#E39325':'#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <BodyText text={cats.name}/>
                  {/* <Text style={[styles.text, { color: '#000' }]}>{}</Text> */}
                </Pressable>
              ))
            }
          </View>
          <SectionText text="Menus" textStyle={{ marginBottom: 10, marginTop: 10, }} />
          {
            menus.length > 0 ? <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}
              >{
                  menus.map((menu: IMenu, index) => (
                    <View key={index}>
                      <DishCard
                        image={require("../../assets/images/foosampleimage.png")}
                        title={menu.title}
                        madeByChef={menu?.chef?.name}
                        price={menu?.basePrice}
                        onPress={() => { }}
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


          <SectionText text="Our Chefs" textStyle={{ marginBottom: 5, marginTop: 20 }} />

          {
            chefs.length > 0 ? chefs.map((chef: IChef, index) => (
              <View key={index}>
                <ChefCard
                  specialty={chef.specialties}
                  image={chef?.profilePic}
                  name={chef.name}
                  location={chef.location}
                  state={chef.state}
                  onPress={() =>router.push({pathname:'/viewchefinfo',params:{id:chef.id,chefPic:chef.profilePic}})}
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
});
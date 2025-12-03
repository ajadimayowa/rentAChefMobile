// app/(tabs)/guest-home.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Pressable } from "react-native";
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

export default function GuestHomeScreen() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const userProfile = useSelector((user: RootState) => user.auth);

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
      icon:'checkbox'
    },
    {
      id: '2',
      title: 'Upcoming',
      description: '',
      icon:'calendar-clear'
    },
    {
      id: '3',
      title: 'Perks',
      description: '',
      icon:'fast-food'
    }
  ]

  const fetchChefs = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/chef/all')
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

  const fetchMenu = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get('/menu/all')
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
      <HeaderBarUser subtitle="Welcome to rent a chef" title={`Hi ${userProfile?.bioData?.fullName?.split(" ")[0]}`} showSearch showBack={false} />

      {
        loading && <PrimaryLoader />
      }

      {!loading &&
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <ReusableImgBGOverlayCard
            image={require('../../assets/images/pasta.png')}
            gradientText={'Enjoy Amazing Dishes'}
            description={`You don't have to break your bank to enjoy exquisite cuisines.`}
          />

          <View style={{ width: '100%',padding:20, flexDirection: 'row', marginTop: 10, gap:20, justifyContent: 'space-between' }}>
            <Pressable
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.btncontainer,
                    { backgroundColor: '#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={'checkbox-outline'} size={34} color={'#000'}/>
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
                  <Ionicons name={'calendar-clear-outline'} size={34} color={'#000'}/>
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
                  <Ionicons name={'fast-food-outline'} size={34} color={'#000'}/>
                  <Text style={[styles.text, { color: '#000' }]}>{'Perks'}</Text>
                </Pressable>
            {/* {
              activities.map((cats, index) => (
                <Pressable
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.btncontainer,
                    { backgroundColor: '#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name={'calendar-clear'} size={34} color={'#000'}/>
                  <Text style={[styles.text, { color: '#000' }]}>{cats.title}</Text>
                </Pressable>
              ))
            } */}

            {/* <Pressable
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.btncontainer,
                    { backgroundColor: '#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.text, { color: '#000' }]}>{'See More'}</Text>
                </Pressable> */}
          </View>

          

          <SectionText text="Made near you" textStyle={{ marginBottom: 15 }} />
          <View style={{ width: '100%',marginBottom:10, flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
            {
              menuCategories.map((cats, index) => (
                <Pressable
                key={index}
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.catbtncontainer,
                    { backgroundColor: '#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.text, { color: '#000' }]}>{cats.title}</Text>
                </Pressable>
              ))
            }

            <Pressable
                  onPress={() => console.log('ok')}
                  style={({ pressed }) => [
                    styles.catbtncontainer,
                    { backgroundColor: '#fff' },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.text, { color: '#000' }]}>{'See all'}</Text>
                </Pressable>
          </View>
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
                  image={chef?.gender == 'f' ? require("../../assets/images/chefAvatar.jpg") : require("../../assets/images/maleChefAvata.png")}
                  name={chef.name}
                  location={chef.location}
                  state={chef.state}
                  onPress={() => { }}
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
    alignItems:'center',
    justifyContent:'center',
    height:'100@ms',
    width:'100@ms',
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
    alignItems:'center',
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
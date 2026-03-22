// app/(tabs)/guest-home.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Pressable, RefreshControl, TouchableOpacity } from "react-native";
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
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import BackgroundImageCard from "@/components/BackgroundImageCard";
import CreateQuoteModal from "@/components/modals/profile/CreateQuoteModal";
import HeaderBarChef from "@/components/HeaderBarChef";

export default function GuestHomeScreen() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const chefProfile = useSelector((user: RootState) => user.chef);
  const userLocation = useSelector((location: RootState) => location.location);
  const [onQuoteModal, setOnQuoteModal] = useState(false);
  const [chefData, setChefData] = useState<IChef | any>();
  const [notifications, setNotifications] = useState<any[]>([]);

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

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications?userId=${chefProfile.chefData.id}`);
      if (res?.data?.success) {
        setNotifications(res?.data?.payload || []);
      }
    } catch (err) {
      console.log('fetch notifications error', err);
    }
  }

  useEffect(() => {
    fetchChefProfile()
    fetchNotifications()
  }, [router])
  


  return (
    <>
    <View style={styles.container}>
      {/* <HeaderBarUser subtitle="Welcome to rent a chef" title={`Hi ${userProfile?.bioData?.fullName?.split(" ")[0]}`} showSearch showBack={false} /> */}
      <HeaderBarChef location={`How are you today?`} fullName={`Hi Chef ${chefProfile?.chefData?.name}`} showSearch showBack={false} notificationCount={notifications.length} onPressNotifications={()=>router.push('/notifications')} />

      {
        loading && <PrimaryLoader />
      }

      {!loading &&
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchChefProfile} />
          }
          contentContainerStyle={{ padding: 20 }}>
          {/* <ReusableImgBGOverlayCard
            image={require('../../assets/images/pasta.png')}
            gradientText={'Enjoy Amazing Dishes'}
            description={`You don't have to break your bank to enjoy exquisite cuisines.`}
          /> */}

          <View style={[styles.card,{backgroundColor:'#fff7e9ff'}]}>
            <View style={styles.rowSection}>
              <SectionText text={'Here is how you are doing'} />
            </View>

            <View style={styles.rowSection}>
              <BodyText text={'Total Bookings'} />
              <BodyText text={chefData?.totalChefBooking ?? '0'} />
            </View>
<View style={styles.rowSection}>
              <BodyText text={'Upcoming'} />
              <BodyText text={`${chefData?.totalUpcoming ?? '0'}`} />
            </View>

            <View style={styles.rowSection}>
              <BodyText text={'Completed'} />
              <BodyText text={`${chefData?.totalCompletedBooking ?? '0'}`} />
            </View>

            
          </View>


          <View style={styles.card2}>

                 <TouchableOpacity style={styles.memberCard}>
                    <FontAwesome6 size={34} name="calendar" />
                    <BodyText text="Upload Menu" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.memberCard}>
                    <Ionicons size={34} name="fast-food" />
                    <BodyText text="View menu" />
                </TouchableOpacity>

               

            </View>

          {/* <SectionText text="Special Menus" textStyle={{ marginBottom: 10, marginTop: 10, }} /> */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}
          >{
              menus.map((menu: IMenu, index) => (
                <View key={index}>
                  <DishCard
                    image={menu?.image}
                    title={menu.title}
                    description={menu?.description}
                    price={menu?.basePrice}
                    onPress={() => router.push({ pathname: './viewspecialmenubooking', params: { id: menu.id } })}
                  />

                </View>
              ))
            }

          </ScrollView> */}



          {/* <SectionText text="Featured chefs" textStyle={{ marginBottom: 5, marginTop: 20 }} />

          {
            chefs.length > 0 ? chefs.map((chef: IChef, index) => (
              <View key={index}>
                <ChefCard
                  specialty={chef.specialties}
                  chefCat={chef?.category?.name}
                  image={chef?.profilePic}
                  name={chef.name}
                  location={chef.location}
                  state={chef.state}
                  onPress={() => router.push({ pathname: '/viewchefinfo', params: { id: chef.id, chefPic: chef.profilePic } })}
                />
              </View>
            ))
              :
              <View style={{ width: '100%', height: 200, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="chef-hat" size={48} style={{ margin: 10 }} color={Colors.primary.base} />
                <Text style={{ width: '100%', textAlign: 'center' }}>No Chefs At This Time</Text>
              </View>
          } */}

         
        </ScrollView>
      }
    </View>

    <CreateQuoteModal
    visible={onQuoteModal}
    onClose={()=>setOnQuoteModal(false)}
    />
    </>
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
fab: {
    position: "absolute",
    right: 20,
    bottom: 10,
    backgroundColor: "#ff733b",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    width: "100%",
    marginTop: "10@vs",
    marginBottom: "10@vs",
    gap: "10@s",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: "12@s",
    backgroundColor: "#fff",
    borderRadius: "12@s",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android shadow
    elevation: 5,
  },
  rowSection: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  card2: {

        flex: 1,
        gap:10,
        width: "100%",
        marginTop: "5@vs",
        marginBottom: "3@vs",
        padding: "12@s",
        backgroundColor: "#fff",
        borderRadius: "12@s",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    memberCard: {
        alignItems:'center',
        justifyContent:'center',
        height:150,
        width:150,
        gap: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd',
        margin: 10,
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    memberInputs: {
        gap: 2,
        width: '100%',
    },
    addMemberButtonContainer: {
        width: '100%',
        marginTop: 10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        marginBottom: '10@ms'
    },
});
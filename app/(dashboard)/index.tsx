// app/(tabs)/guest-home.tsx
import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { View, ScrollView, Text, Pressable, RefreshControl, Linking, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import DishCard from "@/components/DishCard";
import SectionText from "@/components/typography/SectionText";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServiceCategories } from "@/services/serviceCategoryService";
import { getServicesByCategory } from "@/services/serviceService";
import { getSpecialMenus } from "@/services/menuService";
import { getChefs } from "@/services/chefService";
import { getNotifications } from "@/services/notificationService";
import Toast from "react-native-toast-message";
import PrimaryLoader from "@/components/Loader";
import { IMenu, ISpecialMenu } from "@/interfaces/menu";
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
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ServiceCategoryServicesModal from "@/components/modals/services/ServiceCategoryServicesModal";
import BackgroundImageCard from "@/components/BackgroundImageCard";
import CreateQuoteModal from "@/components/modals/profile/CreateQuoteModal";
import AddToFavoritesModal from '@/components/modals/menus/AddToFavoritesModal';
import RateMenuModal from '@/components/modals/menus/RateMenuModal';
import ListCardWithIconAndNavigation from "@/components/cards/ListCardWithIconAndNavigation";
import FrameCard from "@/components/cards/FrameCard";
import { serviceCatIcons, serviceIcons } from "@/constants/Typography";
import SpecialServiceCard from "@/components/SpecialServiceCard";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";
import { isProfileComplete, shuffleArray } from "@/helpers/utils";

export default function GuestHomeScreen() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: styles.headerStyle,
      headerTintColor: "#fff",

      headerTitle: () => (
        <View>
          <BodyText
            textStyle={{ color: '#fff', fontFamily: '' }}
            text={`Hi ${userProfile?.bioData?.fullName?.split(" ")[0] || "Guest"}`}
          />
          <BodyText
            textStyle={{ color: '#fff', fontSize: 18, fontFamily: 'titleFont' }}
            text={`What service do you need?`}
          />
          <TouchableOpacity onPress={() => router.push('/search')}>
            <View style={styles.searchBox}>
              <BodyText text="Search service..." />
              <Ionicons name="search-outline" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      ),

      headerTitleStyle: {
        fontWeight: "600",
        fontFamily: "titleFont",
      },

      // headerLeft: () => (
      //   <TouchableOpacity onPress={() => navigation.goBack()}>
      //     <Entypo name="chevron-left" size={24} color="white" />
      //   </TouchableOpacity>
      // ),
    });
  }, [navigation]);
  const navigateToServiceBooking = (service: any) => {
    // console.log('navigateToServiceBooking', service);
    if (!isProfileComplete(userData)) {
      Toast.show({
        type: 'error',
        text1: 'Kindly Complete your profile to make a booking',
      });
      return;
    }

    const resolvedServiceId = String(service?.id || service?._id || '').trim();
    if (!resolvedServiceId) {
      Toast.show({
        type: 'error',
        text1: 'Unavailable service',
        text2: 'This service cannot be opened right now.',
      });
      return;
    }

    const workflow = String(service?.workflow || '');
    // console.log('navigateToServiceBooking', { workflow });
    const serviceName = String(service?.name || '');
    const serviceId = String(service?.id || service?._id || '');
    const categoryId =
      service?.categoryId?.id || selectedCategory?.id || '';
    const params = {
      serviceId: serviceId,
      serviceName,
      serviceCategoryId: categoryId,
      workflow: workflow,
    };

    // console.log('navigateToServiceBooking', { params });
    let resolvedRoute = '';

    switch (workflow) {
      case 'ALASE_SERVICE':
        resolvedRoute = '/booking/alaseBookingScreen';
        break;
      case 'DAILY_CHEF':
        resolvedRoute = '/booking/dailyChefBookingScreen';
        break;
      case 'DATE_NIGHT':
        resolvedRoute = '/booking/dateNightBookingScreen';
        break;
      case 'DINNER_PARTY':
        resolvedRoute = '/booking/dinnerPartyBookingScreen';
        break;
      case 'EVENT_CATERING':
        resolvedRoute = '/booking/eventCateringBookingScreen';
        break;
      case 'STORAGE_PACKAGE':
        resolvedRoute = '/booking/storagePackageBookingScreen';
        break;

      case 'HOME_RESIDENCE':
        resolvedRoute = '/booking/residentialBookingScreen';
        break;

      default:
        resolvedRoute = '';
        break;
    }

    if (!resolvedRoute) {
      switch (true) {
        case serviceName.includes('event'):
          resolvedRoute = '/booking/event-catering';
          break;
        case serviceName.includes('residential'):
          resolvedRoute = '/booking/daily-chef';
          break;
        default:
          resolvedRoute = '/booking/daily-chef';
          break;
      }
    }
    router.push({ pathname: resolvedRoute as any, params });
  };
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [categoryServices, setCategoryServices] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [chefs, setChefs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const prevNotificationIdsRef = useRef<Set<string>>(new Set());
  const userProfile = useSelector((user: RootState) => user.auth);
  const userLocation = useSelector((location: RootState) => location.location);
  const [onQuoteModal, setOnQuoteModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser>();
  const profileComplete = isProfileComplete(userData);

  const fetchUserProfile = async () => {
    if (!userProfile?.bioData?.id) return;
    try {
      const res = await api.get(`/user/${userProfile.bioData.id}`);
      if (res?.data?.success) {
        setUserData(res?.data?.payload);
      }
    } catch (error) {
      // silent — doesn't block the rest of the home screen
    }
  };

  const requireCompleteProfile = (): boolean => {
    if (!profileComplete) {
      Toast.show({
        type: "error",
        text1: "Kindly Complete your profile to make a booking",
      });
      return false;
    }
    return true;
  };

  const handleServiceCategoryPress = (category: any) => {
    if (!requireCompleteProfile()) return;
    setSelectedCategory(category);
    setShowCategoryModal(true);
    fetchServicesByCategory(category?.id);
  };

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const items = await getChefs(undefined, undefined, undefined, undefined, 20);
      setChefs(shuffleArray(items || []).slice(0, 10));
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Error fetching chefs',
      });
    } finally {
      setLoading(false);
    }
  };



  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await getSpecialMenus({ limit: 20, page: 1 });
      setMenus(response?.data || []);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceCategories = async () => {
    setLoading(true);
    try {
      const items = await getServiceCategories();

      const formatted = items.map((item: any) => ({
        ...item,
        icon: serviceCatIcons[item.slug] ?? require("../../assets/icons/chefIcon.png"),
      }));

      setServiceCategories(formatted || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Error fetching chefs',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByCategory = async (categoryId: string) => {
    setCategoryLoading(true);
    try {
      const items = await getServicesByCategory(categoryId);
      const formatted = items.map((item: any) => ({
        ...item,
        icon: serviceIcons[item.name] ?? require("../../assets/icons/chefIcon.png"),
      }));
      setCategoryServices(formatted || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error?.response?.message || 'Error fetching services',
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const openWhatsApp = async () => {
    const url = "https://api.whatsapp.com/send?phone=2348166467555";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  const fetchNotifications = async () => {
    // setLoading(true);
    try {
      const items = await getNotifications(userProfile.bioData.id);
      if (items) {

        // if first time fetching, seed the seen set without notifying
        if (prevNotificationIdsRef.current.size === 0) {
          items.forEach((n: any) => prevNotificationIdsRef.current.add(n.id));
          setNotifications(items);
        } else {
          try {
            const newItems = items.filter((n: any) => !prevNotificationIdsRef.current.has(n.id));
            newItems.forEach((n: any) => {
              prevNotificationIdsRef.current.add(n.id);
              if (n.type === 'procurement-update') {
                Toast.show({ type: 'success', text1: n.title || 'Procurement update', text2: n.message });
              }
            });
          } catch (e) {
            // ignore
          }

          setNotifications(items);
        }
      }
    } catch (error: any) { }
  };

  // Poll for notifications while this screen is mounted
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchNotifications();
  //   }, 30000); // 30s

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    fetchServiceCategories();
    fetchMenu();
    fetchChefs();
    fetchNotifications();
  }, []);

  // Re-fetch on every focus (not just mount) so a profile edited on another
  // screen and navigated back from is reflected immediately in the
  // completeness gate below — otherwise this screen keeps using the stale
  // userData it fetched before the user left to edit their profile.
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [userProfile?.bioData?.id])
  );

  return (
    <>
      <View style={styles.container}>
        {/* <HeaderBarLoaction
          notificationCount={notifications.length}
          profilePic={userProfile.bioData.profilePic}
          location={`${userLocation.userState}`}
          fullName={}
          showSearch
          showBack={false}
        /> */}

        {loading && <PrimaryLoader />}

        {!loading && (
          <ScrollView
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { fetchChefs(); fetchMenu(); fetchServiceCategories(); fetchNotifications(); fetchUserProfile(); }} />}
            contentContainerStyle={{ padding: 20 }}
          >
            <ReusableImgBGOverlayCard
              image={require('../../assets/images/pasta.png')}
              gradientText={'Enjoy Amazing Dishes'}
              description={`You don't have to break your bank to enjoy exquisite cuisines.`}
            />


            <SectionText text="Our Services" textStyle={{ marginTop: 10 }} />
            <FrameCard style={styles.cardList}>
              {serviceCategories.map((category, index) => (
                <Pressable
                  key={category?.id || index}
                  onPress={() => {
                    // setSelectedCategory(category);
                    handleServiceCategoryPress(category);
                  }}>
                  <ListCardWithIconAndNavigation
                    data={category}
                    showIcon={true}
                  />
                </Pressable>
              ))}
            </FrameCard>

            <SectionText text="Featured Services" textStyle={{ marginBottom: 10, marginTop: 10 }} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}>
              {menus.map((menu: ISpecialMenu, index) => (
                <View key={index}>
                  <SpecialServiceCard
                    menu={menu}
                    isProfileComplete={profileComplete}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <SectionText text="Featured chefs" textStyle={{ marginBottom: 5, marginTop: 20 }} />
              <Pressable onPress={() => router.push('/chefs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>

            {chefs.length > 0 ? (
              chefs.map((chef: IChef, index) => (
                <View key={index}>
                  <ChefCard
                    chef={chef}
                  />
                </View>
              ))
            ) : (
              <View style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="chef-hat" size={48} style={{ margin: 10 }} color={Colors.primary.base} />
                <Text style={{ textAlign: 'center' }}>No Chefs At This Time</Text>
              </View>
            )}

            <BackgroundImageCard
              onPress={() => setOnQuoteModal(true)}
              image={require('../../assets/images/imgBgd.png')}
              title="Do you have a special request"
            />
          </ScrollView>
        )}
      </View>

      <Pressable style={styles.fab} onPress={openWhatsApp}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </Pressable>

      <CreateQuoteModal visible={onQuoteModal} onClose={() => setOnQuoteModal(false)} />
      <ServiceCategoryServicesModal
        visible={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setSelectedCategory(null); setCategoryServices([]); }}
        title={`${selectedCategory?.name || ''} Options`}
        services={categoryServices}
        loading={categoryLoading}
        onSelectService={(service) => {
          setShowCategoryModal(false);
          navigateToServiceBooking(service);
        }}
      />
    </>
  );
}

const styles = ScaledSheet.create({
  headerStyle: {
    backgroundColor: "#000000",
    height: '155@s'
  },
  container: { flex: 1, backgroundColor: "#F3F3F5" },
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

  cardList: {
    width: "100%",
    gap: "8@s",
    marginTop: "6@vs",
    marginBottom: "6@vs",
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: "12@s",
    paddingVertical: "14@vs",
    paddingHorizontal: "14@s",
    borderRadius: "16@s",
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryIconWrap: {
    width: "44@s",
    height: "44@s",
    borderRadius: "22@s",
    backgroundColor: "#F5F2EE",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryEmoji: {
    fontSize: "22@s",
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: "15@s",
    fontFamily: "titleFont",
    color: "#1E222A",
  },
  categorySubtitle: {
    fontSize: "12@s",
    color: "#8A9099",
    marginTop: "2@vs",
  },
  newBadge: {
    position: "absolute",
    top: "8@vs",
    right: "10@s",
    backgroundColor: "#E39325",
    paddingVertical: "2@vs",
    paddingHorizontal: "8@s",
    borderRadius: "12@s",
  },
  newBadgeText: {
    fontSize: "10@s",
    color: "#fff",
    fontFamily: "titleFont",
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
  searchBox: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "8@s",
    padding: "10@s",
    marginTop: "10@vs",
    width: '100%'
  },
  searchInput: { flex: 1, padding: "8@s", color: "#333" },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: "13@ms",
    fontWeight: "600",
    color: Colors.primary.base,
  },
});
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  RefreshControl,
  Linking,
  Pressable,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Entypo, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "@/store";
import { performLogout } from "@/services/auth/logout";
import BodyText from "@/components/typography/BodyText";
import SectionText from "@/components/typography/SectionText";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";

export default function GuestChefsScreen() {
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IUser>();



  const fetchUserProfile = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get(`/user/${userProfile.id}`)
      
      if (res?.data?.success) {
        setUserData(res?.data?.payload)
        setLoading(false)
      } else {
        
        setLoading(false)
        Toast.show({
          type: 'error',
          text1: 'Network error',
          text2: res?.data?.message || 'Something went wrong!',
        });
      }

    } catch (error: any) {
      
      setLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error?.response?.message || 'Error fetching chefs',
      });
    }
  }

  useEffect(() => {
    fetchUserProfile();
  }, [userProfile?.id]);

  const openPPolicy = async () => {
      const url = "https://rentachefng.com/privacy-policy/";
  
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        // console.log("Can't open WhatsApp link");
      }
    };

    const openTOS = async () => {
      const url = "https://rentachefng.com/terms-of-service/";
  
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        // console.log("Can't open WhatsApp link");
      }
    };

  const openFAQ = async () => {
    const url = "https://rentachefng.com/faq/";

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // console.log("Can't open WhatsApp link");
    }
  };

  const callSupport = async () => {
    const url = "tel:+2348166467555";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleLogout = async () => {
    await performLogout();
    router.replace('/authscreen')

  }
  const accountRows = [
    {
      title: "Personal Information",
      subtitle: "View and update your details",
      icon: <Ionicons name="person-circle-outline" size={20} color="#3F2E20" />,
      iconBg: "#F6EBDD",
      onPress: () => router.push({ pathname: `/viewprofile`, params: { id: userProfile.id } }),
    },
    {
      title: "Notifications",
      subtitle: "Alerts, reminders and updates",
      icon: <Ionicons name="notifications-outline" size={20} color="#1E3A5F" />,
      iconBg: "#E6EEF7",
      onPress: () => router.push({ pathname: `/notifications`, params: { id: userProfile.id } }),
    },
  ];

  const supportRows = [
    {
      title: "Privacy Policy",
      subtitle: "Read how your data is handled",
      icon: <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#3F2E20" />,
      iconBg: "#F6EBDD",
      onPress: openPPolicy,
    },
    {
      title: "Terms of Service",
      subtitle: "Understand platform usage terms",
      icon: <MaterialCommunityIcons name="file-document-outline" size={20} color="#1E3A5F" />,
      iconBg: "#E6EEF7",
      onPress: openTOS,
    },
    {
      title: "FAQ & Help",
      subtitle: "Answers to common questions",
      icon: <Ionicons name="help-buoy-outline" size={20} color="#2E5D49" />,
      iconBg: "#E4F3EC",
      onPress: openFAQ,
    },
  ];

  return (
    <SafeAreaView style={styles.frame}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUserProfile} />}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBlobOne} />
          <View style={styles.heroBlobTwo} />

          <View style={styles.avatarWrap}>
            {userData?.profilePic ? (
              <Image source={{ uri: userData.profilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={44} color="#B8A98C" />
              </View>
            )}
          </View>

          <SectionText textStyle={styles.nameText} text={userProfile?.fullName} />
          <BodyText textStyle={styles.emailText} text={`${userData?.email ?? ""}`} />
          <BodyText textStyle={styles.completeProfileText} text="Kindly do well to complete your profile" />

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="calendar-outline" size={16} color="#6B4C2C" />
              <Text style={styles.statText}>Active Account</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="location-outline" size={16} color="#6B4C2C" />
              <Text style={styles.statText}>{userData?.address?.stateName ?? "Nigeria"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {accountRows.map((item, index) => (
              <Pressable
                key={item.title}
                style={[styles.menuRow, index !== accountRows.length - 1 && styles.menuRowBorder]}
                onPress={item.onPress}
              >
                <View style={[styles.rowIconWrap, { backgroundColor: item.iconBg }]}>{item.icon}</View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8A84" />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.menuCard}>
            {supportRows.map((item, index) => (
              <Pressable
                key={item.title}
                style={[styles.menuRow, index !== supportRows.length - 1 && styles.menuRowBorder]}
                onPress={item.onPress}
              >
                <View style={[styles.rowIconWrap, { backgroundColor: item.iconBg }]}>{item.icon}</View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8A84" />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIconWrap}>
            <Entypo size={20} name="old-phone" color="#2E5D49" />
          </View>
          <View style={styles.supportTextWrap}>
            <Text style={styles.supportTitle}>Need manual booking support?</Text>
            <Text style={styles.supportSubtitle}>+2348166467555</Text>
          </View>
          <Pressable onPress={callSupport} style={styles.callButton}>
            <Ionicons name="call-outline" size={17} color="#FFFFFF" />
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutIconWrap}>
            <MaterialCommunityIcons name="logout" size={18} color="#A62C2C" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  frame: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: "16@ms",
    paddingBottom: "28@ms",
    gap: "14@ms",
  },
  heroCard: {
    marginTop: "8@ms",
    width: "100%",
    borderRadius: "24@ms",
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    paddingVertical: "24@ms",
    paddingHorizontal: "16@ms",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  heroBlobOne: {
    position: "absolute",
    top: "-25@ms",
    right: "-18@ms",
    height: "110@ms",
    width: "110@ms",
    borderRadius: "110@ms",
    backgroundColor: "#e4e3e3",
  },
  heroBlobTwo: {
    position: "absolute",
    bottom: "-45@ms",
    left: "-25@ms",
    height: "130@ms",
    width: "130@ms",
    borderRadius: "130@ms",
    backgroundColor: "#e4e3e3",
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: "999@ms",
    elevation: 6,
    shadowColor: "#9A8365",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  avatar: {
    height: "102@ms",
    width: "102@ms",
    borderRadius: "999@ms",
    backgroundColor: "#FFFFFF",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1ECE6",
  },
  verifiedPill: {
    marginTop: "12@ms",
    flexDirection: "row",
    alignItems: "center",
    gap: "6@ms",
    backgroundColor: "#F7E7CC",
    borderColor: "#E9D1AC",
    borderWidth: 1,
    paddingHorizontal: "10@ms",
    paddingVertical: "4@ms",
    borderRadius: "999@ms",
  },
  verifiedText: {
    color: "#8A5A14",
    fontWeight: "700",
    fontSize: "11@ms",
  },
  nameText: {
    marginTop: "10@ms",
    color: "#291B12",
    fontSize: "20@ms",
    fontWeight: "700",
  },
  emailText: {
    marginTop: "2@ms",
    color: "#6E625A",
    fontSize: "13@ms",
  },
  completeProfileText: {
    marginTop: "6@ms",
    color: "#8A5A14",
    fontSize: "12@ms",
    textAlign: "center",
  },
  statsRow: {
    marginTop: "14@ms",
    width: "100%",
    flexDirection: "row",
    gap: "10@ms",
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "6@ms",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECDCC9",
    borderRadius: "14@ms",
    paddingVertical: "10@ms",
  },
  statText: {
    color: "#6B4C2C",
    fontWeight: "600",
    fontSize: "12@ms",
  },
  sectionWrap: {
    gap: "8@ms",
  },
  sectionTitle: {
    color: "#5A4D44",
    fontWeight: "700",
    fontSize: "14@ms",
    paddingHorizontal: "4@ms",
  },
  menuCard: {
    width: "100%",
    borderRadius: "20@ms",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  menuRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "14@ms",
    paddingVertical: "13@ms",
    gap: "10@ms",
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3ECE4",
  },
  rowIconWrap: {
    height: "38@ms",
    width: "38@ms",
    borderRadius: "12@ms",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: "#2E241C",
    fontWeight: "700",
    fontSize: "14@ms",
  },
  rowSubtitle: {
    color: "#8A8078",
    fontWeight: "500",
    fontSize: "11@ms",
    marginTop: "2@ms",
  },
  supportCard: {
    width: "100%",
    borderRadius: "18@ms",
    backgroundColor: "#EAF5EF",
    borderWidth: 1,
    borderColor: "#D5E9DD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "12@ms",
    paddingVertical: "12@ms",
    gap: "10@ms",
  },
  supportIconWrap: {
    height: "38@ms",
    width: "38@ms",
    borderRadius: "12@ms",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCEFE4",
  },
  supportTextWrap: {
    flex: 1,
  },
  supportTitle: {
    color: "#244535",
    fontWeight: "700",
    fontSize: "13@ms",
  },
  supportSubtitle: {
    color: "#2E5D49",
    fontWeight: "600",
    marginTop: "1@ms",
    fontSize: "12@ms",
  },
  callButton: {
    height: "36@ms",
    width: "36@ms",
    borderRadius: "18@ms",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E5D49",
  },
  logoutBtn: {
    width: "100%",
    borderRadius: "16@ms",
    borderWidth: 1,
    borderColor: "#F1CDCD",
    backgroundColor: "#FFF4F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "8@ms",
    paddingVertical: "13@ms",
    marginTop: "2@ms",
  },
  logoutIconWrap: {
    height: "26@ms",
    width: "26@ms",
    borderRadius: "8@ms",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE7E7",
  },
  logoutText: {
    color: "#A62C2C",
    fontSize: "14@ms",
    fontWeight: "700",
  },
});
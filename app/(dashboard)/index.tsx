import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import AuthModal from "@/components/AuthModal";
import { ScaledSheet } from "react-native-size-matters";
import { useNavigation, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors"; // optional, fallback used
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";

// replace with your pattern image (transparent PNG)
const PATTERN_IMG: ImageSourcePropType = require("../../assets/images/logoCurved.png");

export default function ExploreScreen() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
 const {staffProfile } = useAppSelector((state) => state.auth);

  
  const navigate = useNavigation();
  const router = useRouter()

  const cards = [
    {
      title: "Total Loan Disbursed",
      amount: "₦ 250,000,000",
      color: "#FFF1F3",
      titleColor: "#FF0000",
      icon: require("../../assets/images/logoCurved.png"),
    },
    {
      title: "Total Defaulted",
      amount: "₦ 18,000,000",
      color: "#FFF7E8",
      titleColor: "#056068",
      icon: require("../../assets/images/logoCurved.png"),
    },
    {
      title: "Total Active",
      amount: "₦ 250,000,000",
      color: "#F1F7FF",
      titleColor: "#F39C12",
      icon: require("../../assets/images/logoCurved.png"),
    },
    {
      title: "Total Repayments",
      amount: "₦ 250,000,000",
      color: "#FFECEC",
      titleColor: "#056068",
      icon: require("../../assets/images/logoCurved.png"),
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const name = await SecureStore.getItemAsync("userName");
      if (!token) {
        setShowAuthModal(true);
      } else {
        setIsSignedIn(true);
        if (name) setUserName(name);
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Gradient Header Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={["#FFFFFF", "#E6CDD3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerCard}
          >
            {/* pattern overlay (transparent PNG) */}
            <Image
              source={PATTERN_IMG}
              style={styles.pattern}
              resizeMode="cover"
            // you can tweak opacity directly on the image or via style
            />

            <View>
              <Text style={styles.greetingText}>
                Hello
              </Text>
              <Text style={styles.greetingText}>
                {staffProfile?.biodata.fullName ? `${staffProfile?.biodata.fullName}` : ""}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createLoanButton}
            onPress={() => router.push("/login")}
            >
              <Text style={styles.createLoanText}>+ New Group</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.grid}>
          {cards.map((card, index) => (
            <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: card.titleColor }]}>{card.title}</Text>
                <Image source={card.icon} style={styles.icon} resizeMode="contain" />
              </View>

              <Text style={styles.amount}>{card.amount}</Text>
            </View>
          ))}
        </View>

        {/* Other content */}
        <View style={styles.contentHolderCard}>
          {/* <PieChartCard
  title="Loan Distribution"
  data={[
    { name: "Active", value: 65, color: "#007AFF" },
    { name: "Defaulted", value: 15, color: "#FF3B30" },
    { name: "Repaid", value: 20, color: "#34C759" },
  ]}
/> */}
          {/* <AreaChartCard
            title="Monthly Loan Growth"
            color="#34C759"
            data={[
              { label: "Jan", value: 30000000 },
              { label: "Feb", value: 42000000 },
              { label: "Mar", value: 35000000 },
              { label: "Apr", value: 52000000 },
              { label: "May", value: 61000000 },
            ]}
          /> */}
        </View>

        {/* {showAuthModal && (
          <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: "15@ms",
  },
  cardWrapper: {
    marginTop: "20@ms",
  },
  contentHolderCard: {
    marginTop: '5@ms',
    backgroundColor: '#fff',
    borderRadius: '5@ms',
    padding: '10@ms',
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCard: {
    height: "150@ms",
    borderRadius: "5@ms",
    paddingHorizontal: "18@ms",
    paddingVertical: "10@ms",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    // elevation for Android
    elevation: 3,
    overflow: "hidden", // ensures pattern doesn't escape rounded corners
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: '25@ms'
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8@ms",
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: "13@ms",
  },
  icon: {
    width: "24@ms",
    height: "24@ms",
  },
  amount: {
    fontSize: "17@ms",
    fontWeight: "700",
    color: "#333",
  },
  card: {
    width: "48%", // two cards per row
    borderRadius: "5@ms",
    paddingVertical: "14@ms",
    paddingHorizontal: "12@ms",
    marginBottom: "12@ms",

    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pattern: {
    position: "absolute",
    right: -10, // nudge it a bit so pattern peeks from the right
    top: -6,
    width: "160@ms",
    height: "120@ms",
    opacity: 0.55, // tweak to make pattern more/less visible
    transform: [{ rotate: "8deg" }], // optional tilt
  },
  greetingText: {
    color: "#333",
    fontSize: "18@ms",
    fontWeight: "600",
    zIndex: 2, // ensure text is above the pattern image
  },
  createLoanButton: {
    backgroundColor: "#1A5745",
    paddingVertical: "8@ms",
    paddingHorizontal: "14@ms",
    borderRadius: "5@ms",
    zIndex: 2,
  },
  createLoanText: {
    color: "#ffffffff",
    fontWeight: "600",
    fontSize: "14@ms",
  },
  text: {
    fontSize: "16@ms",
    color: "#444",
  },
});

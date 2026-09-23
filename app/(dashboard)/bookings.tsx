// app/(tabs)/guest-chefs.tsx
import React, { useLayoutEffect, useState } from "react";
import { View, ScrollView, Pressable,Text} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import Colors from "@/constants/Colors";
import UserActiveBookingTab from "@/components/tabs/UserActiveBookingTab";
import UserReviewedBookingTab from "@/components/tabs/UserReviewedBookingTab";
import UserQuotesTab from "@/components/tabs/UserQuotesTab";
import { useNavigation } from "expo-router";
import BodyText from "@/components/typography/BodyText";
import { TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function BookingsListScreen() {
    const [activeTab, setActiveTab] = useState<"active" | "reviewed" | "quotes">(
        "active"
    );
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState<string>('');

    useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: styles.headerStyle,
      headerTintColor: "#fff",
  
      headerTitle: () => (
        <View>
          <BodyText
          textStyle={{color:'#fff',fontSize:15, fontFamily:'titleFont'}}
            text={`Bookings`}
          />
          <BodyText
          textStyle={{color:'#fff'}}
            text={`Find all your bookings here`}
          />
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

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
                {/* PAGE TITLE */}

                {/* TABS */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 20,
                    }}
                >
                    <Pressable
                        onPress={() => setActiveTab("active")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "active" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "active" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            All bookings
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("reviewed")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "reviewed" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "reviewed" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Reviewed
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("quotes")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "quotes" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "quotes" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Quotes
                        </Text>
                    </Pressable>
                </View>

                {/* TAB CONTENT */}
                <ScrollView style={{ flex: 1 }}>
                    {activeTab === "active" && (
                        <UserActiveBookingTab />
                    )}

                    {activeTab === "reviewed" && (
                       <UserReviewedBookingTab />
                    )}

                    {activeTab === "quotes" && (
                        <UserQuotesTab />
                    )}
                </ScrollView>
            </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerStyle: {
        backgroundColor: "#000000",
        height:'125@s'
    },
  searchBox: {
    flexDirection: "row",
    justifyContent:'space-between',
    paddingHorizontal:'10@s',
    alignItems: "center",
    backgroundColor: "#f8f8fb",
    borderRadius: "5@s",
    minWidth:'100%',
    height:'40@s'
  },
  searchInput: {color: "#333", backgroundColor:'#fbf9f9',width:'80%', height:'35@s'},
});
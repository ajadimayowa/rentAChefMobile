// app/(tabs)/guest-chefs.tsx
import React, { useState } from "react";
import { View, ScrollView, Pressable,Text} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import Colors from "@/constants/Colors";
import UserPendingBookingTab from "@/components/tabs/UserPendingBookingTab";
import UserActiveBookingTab from "@/components/tabs/UserActiveBookingTab";
import UserCompletedBookingTab from "@/components/tabs/UserCompletedBookingTab";
import ChefActiveBookingTab from "@/components/tabs/ChefActiveBookingTab";
import ChefPendingBookingTab from "@/components/tabs/ChefPendingBookingTab";
import ChefCompletedBookingTab from "@/components/tabs/ChefCompletedBookingTab";

export default function ChefBookingScreen() {
   const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
        "active"
    );
  return (
    <View style={styles.container}>
      <HeaderBar
        title="Chef Bookings"
        subtitle="See your bookings here"
      />

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
                            Active
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("pending")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "pending" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "pending" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Upcoming
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("expired")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "expired" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "expired" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Completed
                        </Text>
                    </Pressable>
                </View>

                {/* TAB CONTENT */}
                <ScrollView style={{ flex: 1 }}>
                    {activeTab === "active" && (
                        <ChefActiveBookingTab />
                    )}

                    {activeTab === "pending" && (
                       <ChefPendingBookingTab />
                    )}

                    {activeTab === "expired" && (
                        <ChefCompletedBookingTab />
                    )}
                </ScrollView>
            </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
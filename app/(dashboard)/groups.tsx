import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending">("all");

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return <Text style={styles.tabContent}>List of All Groups</Text>;
      case "active":
        return <Text style={styles.tabContent}>List of Active Groups</Text>;
      case "pending":
        return <Text style={styles.tabContent}>List of Pending Groups</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabHeader}>
        {["all", "active", "pending"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "all"
                ? "All Groups"
                : tab === "active"
                ? "Active Groups"
                : "Pending Groups"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabBody}>{renderContent()}</View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "16@s",
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F5F5F5",
    borderRadius: "10@s",
    marginBottom: "15@s",
    paddingVertical: "6@s",
  },
  tabButton: {
    paddingVertical: "8@s",
    paddingHorizontal: "10@s",
    borderRadius: "8@s",
  },
  activeTabButton: {
    backgroundColor: "#1A5745", // your gradient color can start here
  },
  tabText: {
    color: "#333",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#ffffffff",
    fontWeight: "700",
  },
  tabBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    fontSize: "16@s",
    color: "#333",
  },
});
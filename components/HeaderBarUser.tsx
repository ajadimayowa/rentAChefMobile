// components/HeaderBar.tsx
import React from "react";
import { View, TextInput, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "./buttons/ReusableButton";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?:boolean;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const HeaderBarUser: React.FC<HeaderBarProps> = ({ title, subtitle,showBack, showSearch, onSearch }) => (
  <View style={styles.container}>
    <SafeAreaView>
    {showBack&&<ReusableButton textStyle={{color:'#fff'}} style={{ width: 100, margin:0, padding:0 }} onPress={() => router.back()} iconLeft={"chevron-back"} type="pressableText" title="Go Back" />}
    <View style={{padding:10}}>
      <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {showSearch && (
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search menu,chef..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          onChangeText={onSearch}
        />
        <Ionicons name="search-outline" size={20} color="#999" />
      </View>
    )}
    </View>

    </SafeAreaView>
  </View>
);

const styles = ScaledSheet.create({
  container: { padding: "20@s", backgroundColor: "#EA7052", borderBottomLeftRadius: "20@s", borderBottomRightRadius: "20@s" },
  title: { fontSize: "16@s", color: "#fff", fontWeight: "700" },
  subtitle: { fontSize: "12@s", color: "#ffe" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "8@s",
    paddingHorizontal: "10@s",
    marginTop: "10@vs",
  },
  searchInput: { flex: 1, padding: "8@s", color: "#333" },
});

export default HeaderBarUser;
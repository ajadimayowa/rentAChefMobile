// components/HeaderBar.tsx
import React from "react";
import { View, TextInput, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "./buttons/ReusableButton";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?:boolean;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const HeaderBarTitleAndBack: React.FC<HeaderBarProps> = ({ title, subtitle,showBack, showSearch, onSearch }) => (
    <SafeAreaView style={styles.container}>
    <View style={{width:'100%'}}>
      {showBack&&<ReusableButton textStyle={{color:'#fff'}} style={{ width: 100, margin:0, padding:0 }} onPress={() => router.back()} iconLeft={"chevron-back"} type="pressableText" title="Go Back" />}
<View style={{alignItems:'center',width:'100%'}}>
  <Text style={styles.title}>{title}</Text>
</View>
    </View>
    
   

    </SafeAreaView>
);

const styles = ScaledSheet.create({
  container: { padding: "3@s", backgroundColor: Colors.primary.base, borderBottomLeftRadius: "10@s", borderBottomRightRadius: "10@s" },
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

export default HeaderBarTitleAndBack;
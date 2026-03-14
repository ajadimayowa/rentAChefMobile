// components/HeaderBar.tsx
import React from "react";
import { View, TextInput, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "./buttons/ReusableButton";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import TitleText from "./typography/TitleText";
import SectionText from "./typography/SectionText";
import BodyText from "./typography/BodyText";

interface HeaderBarProps {
  fullName: string;
  location?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const HeaderBarChef: React.FC<HeaderBarProps> = ({ fullName, location,showBack, showSearch, onSearch }) => (
  <View style={styles.container}>
    <SafeAreaView>
      {showBack && <ReusableButton textStyle={{ color: '#fff' }} style={{ width: 100, margin: 0, padding: 0 }} onPress={() => router.back()} iconLeft={"chevron-back"} type="pressableText" title="Go Back" />}
      <View style={{ padding: 10, width:'100%', justifyContent:'space-between',flexDirection:'row',alignItems:'center' }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center' }}>
          
          <View>
            <Text style={styles.title}>{fullName}</Text>
            <Text style={styles.subtitle}>{location}</Text>
          </View>

        </View>
        <Ionicons color={'#fff'} size={28} name="notifications"/>
      </View>

    </SafeAreaView>
  </View>
);

const styles = ScaledSheet.create({
  container: { paddingHorizontal: "10@s", backgroundColor: Colors.primary.base, borderBottomLeftRadius: "20@s", borderBottomRightRadius: "20@s" },
  title: { fontSize: "16@s", color: "#fff", fontWeight: "700" },
  subtitle: { fontSize: "12@s", color: "#ffe" },
  searchBox: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "8@s",
    padding: "10@s",
    marginTop: "10@vs",
  },
  searchInput: { flex: 1, padding: "8@s", color: "#333" },
});

export default HeaderBarChef;
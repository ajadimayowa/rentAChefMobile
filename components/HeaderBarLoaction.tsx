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
  profilePic: string;
  location?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const HeaderBarLoaction: React.FC<HeaderBarProps> = ({ fullName, location, profilePic, showBack, showSearch, onSearch }) => (
  <View style={styles.container}>
    <SafeAreaView>
      {showBack && <ReusableButton textStyle={{ color: '#fff' }} style={{ width: 100, margin: 0, padding: 0 }} onPress={() => router.back()} iconLeft={"chevron-back"} type="pressableText" title="Go Back" />}
      <View style={{ padding: 10 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center' }}>
          {profilePic ? <Image source={profilePic as any} style={{ width: 100, height: 100, borderRadius: 100 }} /> : <Ionicons name="person-circle-outline" size={46} color={'#fff'} />}
          <View>
            <Text style={styles.title}>{fullName}</Text>
            {location && <TouchableOpacity onPress={() => router.push('/states')}><Text style={styles.subtitle}>{location}</Text></TouchableOpacity>}
          </View>

        </View>

        <View>
          <SectionText text="What delicacy
are you craving for today?" textStyle={{ color: '#fff', fontSize: 24, marginTop: 15 }} />
        </View>


        {showSearch && (
          <TouchableOpacity onPress={() => router.push('/search')}>
            <View style={styles.searchBox}>
              {/* <TextInput
              placeholder="Search menu,chef..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              onChangeText={onSearch}
            /> */}
              <BodyText text="Search menu,chef..." />
              <Ionicons name="search-outline" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  </View>
);

const styles = ScaledSheet.create({
  container: { padding: "5@s", backgroundColor: Colors.primary.base, borderBottomLeftRadius: "20@s", borderBottomRightRadius: "20@s" },
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

export default HeaderBarLoaction;
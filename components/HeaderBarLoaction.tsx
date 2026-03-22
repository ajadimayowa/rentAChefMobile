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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface HeaderBarProps {
  fullName: string;
  profilePic: string;
  notificationCount: number;
  location?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const HeaderBarLoaction: React.FC<HeaderBarProps> = ({ fullName, location, notificationCount: notificationCountProp, showBack, showSearch, onSearch }) => {
  const storeCount = useSelector((s: RootState) => s.notifications?.count || 0);
  const unread = typeof notificationCountProp === 'number' ? notificationCountProp : storeCount;
  return (
    <View style={styles.container}>
      <SafeAreaView>
        {showBack && <ReusableButton textStyle={{ color: '#fff' }} style={{ width: 100, margin: 0, padding: 0 }} onPress={() => router.back()} iconLeft={"chevron-back"} type="pressableText" title="Go Back" />}
        <View style={{ padding: 10 }}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', width:'100%',justifyContent:'space-between' }}>
            <View style={{flexDirection:'row'}}>
              <View>
                <Text style={styles.title}>{fullName}</Text>
                {location && <TouchableOpacity onPress={() => router.push('/states')}><Text style={styles.subtitle}>{location}</Text></TouchableOpacity>}
              </View>

            </View>
            
            <TouchableOpacity style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }} onPress={() => router.push('/notifications')}>
              <Ionicons color={'#fff'} size={28} name="notifications"/>
              {unread > 0 && <BodyText textStyle={{color:'#fff'}} text={`${unread}`}/>}
            </TouchableOpacity>

          </View>


          <View>
            <SectionText text="What delicacy
are you craving for today?" textStyle={{ color: '#fff', fontSize: 24, marginTop: 15 }} />
          </View>


          {showSearch && (
            <TouchableOpacity onPress={() => router.push('/search')}>
              <View style={styles.searchBox}>
                <BodyText text="Search menu..." />
                <Ionicons name="search-outline" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          )}


        </View>

      </SafeAreaView>
    </View>
  );
};

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
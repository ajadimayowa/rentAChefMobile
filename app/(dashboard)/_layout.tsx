import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { Link, Tabs, useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import SecureStorage from '@/store/secureStore';
import AuthModal from '@/components/AuthModal';
import SearchScreen from '@/components/SearchScreen';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  

  // 🔑 Auth guard for tab presses
  const authGuard = (screen: any) => ({
    tabPress: async (e: any) => {
      e.preventDefault(); // stop default tab switching
      const token = await SecureStorage.getItem('token');
      if (!token) {
        setShowAuthModal(true);
      } else {
        router.push(screen);
      }
    },
  });

  return (
    <>
       <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#EA7052",
        tabBarInactiveTintColor: "#111010ff",
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // <--- hide the extra header
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home-fill" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="chefs"
        options={{
          title: "Chefs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chef-hat" size={size} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>

    

      {/* 🔑 Auth modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* 🔍 Search modal */}
      <SearchScreen
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </>
  );
}

// 🎨 Scaled styles
const styles = ScaledSheet.create({
  headerContainer: {
    flex: 1,
    marginHorizontal: '10@s',
    width: '100%',
  },
  logo: {
    width: '65@s',
    height: '55@s',
    marginRight: '10@s',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dedbdbff',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    borderRadius: '20@s',
  },
});
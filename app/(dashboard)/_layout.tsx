import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import SecureStorage from '@/store/secureStore';
import AuthModal from '@/components/AuthModal';
import SearchScreen from '@/components/SearchScreen';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const router = useRouter();

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
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: useClientOnlyValue(false, true),
        }}
      >
        {/* 🏠 Home */}
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => (
              <View style={styles.headerContainer}>
                <Image
                  source={require('../../assets/images/logoCurved.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            ),
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="gear"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{
                        marginRight: 15,
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />

        {/* 💬 Messages */}
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="people" color={color} />
            ),
          }}
          listeners={authGuard('/groups')}
        />

        {/* 🛒 Sell */}
        <Tabs.Screen
          name="members"
          options={{
            title: 'Member',
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="person" color={color} />
            ),
          }}
          listeners={authGuard('/members')}
        />

        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="user-circle-o" color={color} />
            ),
          }}
          listeners={authGuard('/profile')}
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
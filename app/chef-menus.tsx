import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import api from '@/services/apiConfig';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import SectionText from '@/components/typography/SectionText';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ChefMenusScreen() {
  const chefProfile = useSelector((s: RootState) => s.chef?.chefData);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/menu/getMenus?chefId=${chefProfile?.id || chefProfile?.staffId}`);
      if (res?.data?.success) setMenus(res?.data?.payload || []);
    } catch (err: any) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Failed to load menus' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <SectionText text="Your Menus" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {menus.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text>No menus found</Text>
          </View>
        ) : (
          menus.map((m: any, i: number) => (
            <TouchableOpacity key={i} onPress={() => router.push({ pathname: '/viewmenu', params: { id: m.id } })} style={{ marginBottom: 12 }}>
              <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
                {m.menuPic ? <Image source={{ uri: m.menuPic }} style={{ width: '100%', height: 180 }} /> : null}
                <View style={{ padding: 12 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16 }}>{m.month}</Text>
                  <Text style={{ color: '#666', marginTop: 6 }}>{Array.isArray(m.weeks) ? `${m.weeks.length} week(s)` : ''}</Text>
                  <Text style={{ marginTop: 8, color: m.approved ? '#2a9d2a' : '#d28a2a' }}>{m.approved ? 'Approved' : 'Pending Approval'}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/viewmenu', params: { id: m.id } })} style={{ padding: 10, backgroundColor: '#E39325', borderRadius: 6 }}>
                      <Text style={{ color: '#fff' }}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});

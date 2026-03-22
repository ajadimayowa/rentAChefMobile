import ReusableCard from "@/components/cards/ReusableCard";
import PrimaryLoader from "@/components/Loader";
import BodyText from "@/components/typography/BodyText";
import SectionText from "@/components/typography/SectionText";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllAsRead,
} from '@/store/slices/notificationsSlice';
import { setUserState } from "@/store/slices/locationSlice";

export default function NotificationsScreenModal() {
    const dispatch = useDispatch<AppDispatch>();
    const userProfile = useSelector((user: RootState) => user.auth);
    const chefProfile = useSelector((state: RootState) => state.chef);

    // Use notifications slice as single source of truth
    const { items: notifications = [], loading = false, page = 1, pages = 1, count: unreadCount = 0 } = useSelector((s: RootState) => s.notifications || {} as any);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // console.log('okkkk')

  const loadNotifications = useCallback(async (p = 1) => {
    const id = chefProfile?.chefData?.id || userProfile?.bioData?.id;
    if (!id) return;
    if (p > 1) setIsLoadingMore(true);
    await dispatch(fetchNotifications({ userId: id, page: p } as any));
    setIsLoadingMore(false);
  }, [chefProfile, userProfile, dispatch]);

    useEffect(() => {
        loadNotifications(1);
    }, [loadNotifications]);

    const handleMarkAsRead = async (notification: any) => {
        if (!notification || notification.isRead) return;
        try {
            await dispatch(markNotificationAsRead(notification.id) as any);
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not mark notification as read' });
        }
    };

    const handleMarkAll = async () => {
        const id = chefProfile?.chefData?.id || userProfile?.bioData?.id;
        if (!id) return Toast.show({ type: 'info', text1: 'No user', text2: 'Cannot mark all' });
        try {
            await dispatch(markAllAsRead({ userId: id }) as any);
            Toast.show({ type: 'success', text1: 'Marked all as read' });
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not mark all as read' });
        }
    };

    const loadMore = () => {
        if (page >= pages || isLoadingMore) return;
        loadNotifications(page + 1);
    };

    const navigateForNotification = (notification: any) => {
        const idMatch = String(notification?.message || notification?.resourceId || '').match(/[a-f0-9]{24}/i);
        const id = notification?.resourceId || (idMatch ? idMatch[0] : null);
        const isChef = Boolean(chefProfile?.chefData?.id);
        if (notification?.type === 'booking-confirmation' || notification?.type === 'payment-receipt' || id) {
            const path = isChef ? '/chefviewbookinginfo' : '/clientviewbookinginfo';
            router.push({ pathname: path, params: { id } });
            return;
        }
        return;
    };

    const handleStateSelection = (state: any) => {
        const lgas = state?.localGovernmentAreas ?? [];

        dispatch(setUserState(state?.state));

        router.replace({
            pathname: '/location',
            params: {
                selectedState: JSON.stringify(lgas),
            },
        });
    };
    return (
        <View style={styles.container}>
            {loading && page === 1 ? (
                <PrimaryLoader />
            ) : (
                <ScrollView
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadNotifications(1)} />}
                    style={{ width: '100%', flex: 1 }}
                >
                    <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SectionText text="Notifications" textStyle={{ fontSize: 18, fontWeight: '700' }} />
                        <TouchableOpacity onPress={handleMarkAll} style={{ padding: 8 }}>
                            <BodyText text="Mark all as read" textStyle={{ color: '#007AFF' }} />
                        </TouchableOpacity>
                    </View>

                    {notifications.map((notification: any, index: number) => (
                        <View key={notification.id || index}>
                            <ReusableCard>
                                <TouchableOpacity
                                    onPress={() => {
                                        handleMarkAsRead(notification);
                                        navigateForNotification(notification);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 12,
                                        backgroundColor: notification?.isRead ? '#fff' : '#bcdcffff',
                                        borderRadius: 8,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <BodyText text={notification?.title || 'Notification'} />
                                        <SectionText text={notification?.message || ''} textStyle={{ marginTop: 6 }} />
                                        <BodyText text={new Date(notification?.createdAt).toLocaleString()} textStyle={{ marginTop: 6, color: '#666' }} />
                                    </View>
                                    <AntDesign name="right" size={16} />
                                </TouchableOpacity>
                            </ReusableCard>
                        </View>
                    ))}

                    {page < pages && (
                        <View style={{ padding: 12, alignItems: 'center' }}>
                            <TouchableOpacity onPress={loadMore} style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}>
                                <BodyText text={isLoadingMore ? 'Loading...' : 'Load more'} textStyle={{ color: '#fff' }} />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1
    }
})
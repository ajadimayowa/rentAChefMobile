// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, Image, TextInput, RefreshControl } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import UserActiveAds from "@/components/tabs/UserActiveAds";
import Colors from "@/constants/Colors";
import ChefAboutTab, { IChefABout } from "@/components/tabs/ChefAboutTab";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store";
import SecureStorage from "@/store/secureStore";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { IChef } from "@/interfaces/chef";
import ChefMenuTab from "@/components/tabs/ChefMenuTab";
import ChefServicesTab from "@/components/tabs/ChefServicesTab";
import ReusableButton from "@/components/buttons/ReusableButton";

export default function ViewChefsScreen() {
    const { id, chefPic } = useLocalSearchParams();
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([]);


    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const navigation = useNavigation();
    const router = useRouter()
    const inputs = useRef<TextInput[]>([]);
    const { email } = useLocalSearchParams<{ email: string }>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()
    const handleLogout = async () => {
        await persistor.purge();
        await SecureStorage.removeItem('userToken')
        router.replace('/');

    }

    const [activeTab, setActiveTab] = useState<"active" | "pending" | "expired">(
        "active"
    );

    const [chefInfo, setChefInfo] = useState<IChef | any>();
    const [servicesByChef, setServicesByChef] = useState<any[]>([]);
    const [chefMenu, setChefMenu] = useState<IChef | any>();


    const fetToken = async (): Promise<string> => {
        const token = SecureStorage.getItem('userToken');
        return token
    }

    const fetchChefInfo = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/chef/${id}`)

            // console.log({ seeRes: res })

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Profile Fetched'
                // });
                setChefInfo(res?.data?.payload)
                setLoading(false)
            } else {

                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef information'
                });
                setAds([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef information'
            });
            setAds([])
        }
    }

    const fetchServicesOfferedByChef = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/chefServices/byAChef/${id}`)

            console.log({ seeRes: res })

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Services fectched'
                // });
                setServicesByChef(res?.data?.payload);
                setLoading(false)
            } else {

                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef service'
                });
                setAds([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef service'
            });
            setAds([])
        }
    }

    const fetchChefMenu = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get(`/menu/getMenus?chefId=${id}`)

            console.log({ seeRes: res })

            if (res?.data?.success) {
                // Toast.show({
                //     type: 'success',
                //     text1: 'Menu Fetched!'
                // });
                setChefMenu(res?.data?.payload)
                setLoading(false)
            } else {

                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Error fetching chef menus'
                });
                setAds([])

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef information'
            });
            setAds([])
        }
    }

    useEffect(() => {
        fetchChefInfo();
        fetchChefMenu()
        fetchServicesOfferedByChef()
    }, [])

    return (
        <View style={styles.container}>
            <Image style={{ width: '100%', height: 250 }} source={
                chefPic
                    ? { uri: chefPic }
                    : require('../assets/images/manavatar.png')
            } />
            <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
                {/* PAGE TITLE */}

                {/* TABS */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 20,
                    }}
                >
                    <Pressable
                        onPress={() => setActiveTab("active")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "active" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "active" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            About
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("pending")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "pending" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "pending" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Menu
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("expired")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "expired" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "expired" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Services
                        </Text>
                    </Pressable>
                </View>

                {/* TAB CONTENT */}
                <ScrollView refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchChefInfo} />
                } style={{}}>
                    {activeTab === "active" && (
                        <ChefAboutTab data={chefInfo} />
                    )}

                    {activeTab === "pending" && (
                        <ChefMenuTab data={chefMenu} />
                    )}

                    {activeTab === "expired" && (
                        <ChefServicesTab data={servicesByChef} />
                    )}
                </ScrollView>
                <ReusableButton
                    onPress={async () => {
                        const token = await SecureStorage.getItem('userToken');

                        if (token) {
                            router.push({ pathname: '/viewavailability', params: { chefId: id } });
                        } else {
                            router.push({ pathname: '/register', params: { chefId: id } });
                        }
                    }}
                    style={{ marginTop: 10, marginBottom: 15, borderRadius: 5 }}
                    title="Book Now"
                />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
});
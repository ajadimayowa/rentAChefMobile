// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView, Pressable, Text, Image, RefreshControl, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import Colors from "@/constants/Colors";
import ChefAboutTab from "@/components/tabs/ChefAboutTab";
import { useLocalSearchParams, useNavigation } from "expo-router";
import api from "@/services/apiConfig";
import Toast from "react-native-toast-message";
import { IChefProfile } from "@/interfaces/chef";
import ChefMenuTab from "@/components/tabs/ChefMenuTab";
import ChefServicesTab from "@/components/tabs/ChefServicesTab";
import Entypo from "@expo/vector-icons/build/Entypo";

export default function ViewChefsScreen() {
    const params = useLocalSearchParams<{ id: string, chefPic: string, chefName: string }>();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<"about" | "menu" | "services">(
        "about"
    );

    const [chefInfo, setChefInfo] = useState<IChefProfile>();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `${params.chefName || "Chef Details"}`,
            headerShown: true,
            headerStyle: styles.headerStyle,
            headerTintColor: "#fff",
            headerTitleStyle: {
                fontWeight: "600",
                fontFamily: "titleFont",
            },
            headerLeft: () => <TouchableOpacity onPress={() => navigation.goBack()}><Entypo name="chevron-left" size={24} color="white" /></TouchableOpacity>
        });
    }, [navigation]);

    const fetchChefInfo = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/chef/${params.id}`)
            setChefInfo(res?.data?.payload)
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error fetching chef information'
            });
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchChefInfo();
    }

    useEffect(() => {
        fetchChefInfo();
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.chefImageWrap}>
                <Image style={styles.chefImage} resizeMode="cover" source={
                    params.chefPic
                        ? { uri: params.chefPic }
                        : require('../assets/images/manavatar.png')
                } />
            </View>
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
                        onPress={() => setActiveTab("about")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "about" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "about" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            About
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("menu")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "menu" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                            marginRight: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "menu" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Menu
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("services")}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: activeTab === "services" ? Colors.primary.base : "#fff",
                            borderWidth: 1,
                            borderColor: Colors.primary.base,
                            borderRadius: 8,
                        }}
                    >
                        <Text
                            style={{
                                textAlign: "center",
                                color: activeTab === "services" ? "#fff" : Colors.primary.base,
                                fontWeight: "600",
                            }}
                        >
                            Services
                        </Text>
                    </Pressable>
                </View>

                {/* TAB CONTENT */}
                <ScrollView refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
                } style={{}}>
                    {activeTab === "about" && (
                        <ChefAboutTab data={chefInfo} />
                    )}

                    {activeTab === "menu" && (
                        <ChefMenuTab chefId={params.id} />
                    )}

                    {activeTab === "services" && (
                        <ChefServicesTab />
                    )}
                </ScrollView>
                {/* <ReusableButton
                    onPress={async () => {
                        const token = await SecureStorage.getItem('userToken');

                        if (token) {
                            router.push({ pathname: '/viewavailability', params: { chefId: params.id } });
                        } else {
                            router.push({ pathname: '/register', params: { chefId: params.id } });
                        }
                    }}
                    style={{ marginTop: 10, marginBottom: 5, borderRadius: 5 }}
                    title="Book Now"
                /> */}


            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    headerStyle: {
        backgroundColor: "#000000",
    },
    // Clip to a fixed banner height, but render the image taller than that and
    // let the excess overflow off the bottom — "cover" mode centers by default,
    // which was cropping chefs' heads out of frame in portrait photos.
    chefImageWrap: {
        width: '100%',
        height: '250@vs',
        overflow: 'hidden',
    },
    chefImage: {
        width: '100%',
        height: '130%',
    },
});
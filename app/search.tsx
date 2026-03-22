import ReusableCard from "@/components/cards/ReusableCard";
import DishCard from "@/components/DishCard";
import DishCardVertical from "@/components/DishCardVertical";
import HeaderBar from "@/components/HeaderBar";
import PrimaryLoader from "@/components/Loader";
import ReusableHeader from "@/components/ReusableHeader";
import BodyText from "@/components/typography/BodyText";
import SectionText from "@/components/typography/SectionText";
import Colors from "@/constants/Colors";
import { IMenu, ISpecialMenu } from "@/interfaces/menu";
import api from "@/services/apiConfig";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import AddToFavoritesModal from '@/components/modals/menus/AddToFavoritesModal';
import RateMenuModal from '@/components/modals/menus/RateMenuModal';
import { View, Text, ScrollView, Image, Pressable, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

export default function SearchChefScreenModal() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    // const [states, setStates] = useState<any[]>([]);
    const { selectedState } = useLocalSearchParams();
    const dispatch = useDispatch();
    const [menus, setMenus] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [favModal, setFavModal] = useState(false);
    const [rateModal, setRateModal] = useState(false);

    const lgas = selectedState
        ? JSON.parse(selectedState as string)
        : [];

    console.log(lgas); // array of LGAs
    // console.log('okkkk')

    const fetchMenu = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get('/specialmenu/menus')
            console.log({ seeRes: res?.data?.payload })
            if (res?.data?.success) {
                setMenus(res?.data?.payload)
                setLoading(false)
            } else {
                console.log({ seeAfter: res })
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: 'Network error',
                    text2: res?.data?.message || 'Something went wrong!',
                });
            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: error?.response?.message || 'Invalid credentials',
            });
        }
    }

    // console.log({ seeCats: categories })
    useEffect(() => {
        fetchMenu();
    }, [])
    return (
        <>
        <View style={styles.container}>
            <View style={{ marginVertical: 8 }}>
                {/* Lightweight instant filter input (no Formik here) */}
                <TextInput
                    placeholder="Search menu, chef..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={{ padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 8, backgroundColor: '#fff' }}
                />
            </View>
            {
                loading ? <PrimaryLoader /> :
                    <ScrollView
                        // showsHorizontalScrollIndicator={false}
                        // contentContainerStyle={{ paddingHorizontal: 10, gap: 12 }}
                        // refreshControl={
                        //     <RefreshControl refreshing={loading} onRefresh={fetchStates} />
                        // }
                        style={{ width: '100%', flex: 1 }}>

                        {
                            menus.length > 0 ? <>
                                {
                                    menus
                                        .filter((menu: ISpecialMenu) => {
                                            if (!searchTerm) return true;
                                            const s = searchTerm.toLowerCase();
                                            return (menu.title || '').toLowerCase().includes(s) || (menu.description || '').toLowerCase().includes(s) || (menu.title || '').toLowerCase().includes(s);
                                        })
                                        .map((menu: ISpecialMenu, index) => (
                                            <View key={index} style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                <DishCardVertical
                                                    menu={menu}
                                                />

                                            </View>
                                        ))
                                }
                            </>
                                :
                                <View style={{ width: '100%', height: 100, alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>
                                    <Ionicons color={Colors.primary.base} size={48} name="fast-food" style={{ margin: 10 }} />
                                    <Text style={{ width: '100%', textAlign: 'center' }}>No Menu At This Time</Text>
                                </View>
                        }


                    </ScrollView>
            }
        </View>
        {/* <AddToFavoritesModal
        visible={favModal}
        onClose={() => { setFavModal(false); setSelectedMenuId(null); }}
        menuId={selectedMenuId}
      /> */}

      <RateMenuModal
        visible={rateModal}
        onClose={() => { setRateModal(false); setSelectedMenuId(null); }}
        menuId={selectedMenuId}
      />
        </>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: "2%"
    },
    searchBox: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "8@s",
        padding: "10@s",
        marginTop: "10@vs",
    },
})
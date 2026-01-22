import ReusableCard from "@/components/cards/ReusableCard";
import HeaderBar from "@/components/HeaderBar";
import PrimaryLoader from "@/components/Loader";
import ReusableHeader from "@/components/ReusableHeader";
import BodyText from "@/components/typography/BodyText";
import SectionText from "@/components/typography/SectionText";
import api from "@/services/apiConfig";
import { setUserLoaction } from "@/store/slices/locationSlice";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

export default function LocationFilterScreenModal() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    // const [states, setStates] = useState<any[]>([]);
    const { selectedState } = useLocalSearchParams();
    const dispatch = useDispatch();

    const lgas = selectedState
        ? JSON.parse(selectedState as string)
        : [];

    console.log(lgas); // array of LGAs
    // console.log('okkkk')

    const fetchStates = async () => {
        // const apiUrl = Constants.expoConfig?.extra?.apiUrl
        // console.log('baseUrl',apiUrl)
        setLoading(true)
        try {
            const res = await api.get('/states/get-states')
            console.log({ seeRes: res?.data?.payload })
            if (res?.data) {
                // setStates(res?.data?.payload)
                setLoading(false);
                // Toast.show({
                //     type: 'success',
                //     text1: 'Data Fetched',
                //     text2: res?.data?.message || 'hi',
                // });
            } else {
                console.log({ seeAfter: res })
                setLoading(false);
                Toast.show({
                    type: 'error',
                    text1: 'Login Error',
                    text2: res?.data?.message || 'Invalid credentials',
                });

            }

        } catch (error: any) {
            console.log({ seeErrorBreak: error })
            //   setLoading(false)
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: error?.response?.message || 'Invalid credentials',
            });
        }
    }

    const handleLocationeSelection = (state: any) => {
        const lgas = state?.localGovernmentAreas ?? [];

        dispatch(setUserLoaction(state));

        router.replace('/(dashboard)');
    };

    // console.log({ seeCats: categories })
    // useEffect(() => {
    //     fetchStates();
    // }, [])
    return (
        <View style={styles.container}>
            {
                loading ? <PrimaryLoader /> :
                    <ScrollView
                        // refreshControl={
                        //     <RefreshControl refreshing={loading} onRefresh={fetchStates} />
                        // }
                        style={{ width: '100%', flex: 1 }}>



                        {
                            lgas.map((state: any, index: number) =>
                                <View key={index}>
                                    <ReusableCard>
                                        <TouchableOpacity onPress={() => handleLocationeSelection(state)} key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text>{state}</Text>
                                            <AntDesign name="right" size={16} />
                                        </TouchableOpacity>
                                    </ReusableCard>
                                </View>
                            )
                        }


                    </ScrollView>
            }
        </View>
    )
}

const styles = ScaledSheet.create({
    container: {
        flex: 1
    }
})
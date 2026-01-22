import { RefreshControl, ScrollView, TextInput, Text, TouchableOpacity, View } from "react-native"
import { ScaledSheet } from "react-native-size-matters";
import SectionText from "../typography/SectionText";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import SecureStorage from "@/store/secureStore";
import Toast from "react-native-toast-message";
// import { IAd } from "@/interfaces/ads";
import api from "@/services/apiConfig";
// import ReusableAdCard from "../cards/AdCard";
import PrimaryLoader from "../Loader";
import BodyText from "../typography/BodyText";
import Colors from "@/constants/Colors";
import { IChef } from "@/interfaces/chef";
import { Ionicons } from "@expo/vector-icons";
import TitleText from "../typography/TitleText";
import ReusableButton from "../buttons/ReusableButton";

export interface IChefABout {
    data: IChef
}
const ChefAboutTab: React.FC<IChefABout> = ({ data }) => {
    const localProfile = useSelector((user: RootState) => user.auth.bioData);
    const [ads, setAds] = useState<any[]>([])

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
    return (
        <>
            <ScrollView
                // refreshControl={
                //     <RefreshControl refreshing={loading} onRefresh={fetchAds} />
                // }
                style={{ width: '100%', flex: 1 }}>


                <View style={{ display: 'flex', flexDirection: 'row', justifyContent:'space-between'}}>
                    <View style={{ display: 'flex', flexDirection: 'row', gap:5}}>
                    <Ionicons name="location" size={17} color="#B7D2A4" />
                    <BodyText text={`${data?.location}, ${data?.state}`} />
                    </View>
                    <SectionText textStyle={{color:'#de6e06ff'}} text="N10,0000/hr"/>
                </View>
                <TitleText text={data?.name}/>
                <SectionText text="Specialties"/>
                <View style={{flexDirection:'row', gap:5,marginBottom:40}}>
                    {
                        data?.specialties.map((spe,key)=>(<View key={key} style={style.catbtncontainer}><BodyText text={spe}/></View>))
                    }
                </View>

                <SectionText text="Brief Info"/>
                <BodyText text={data?.bio}/>
            </ScrollView>
        </>

    )
}



const style = ScaledSheet.create({
    container: {
        flex: 1
    },
    catbtncontainer: {
    paddingVertical: "5@ms",
    paddingHorizontal: "10@ms",
    borderRadius: "20@ms",
    alignSelf: "flex-start",
    alignItems: 'center',
    // ✅ Drop shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    backgroundColor:'#ffffffff',

    // ✅ Drop shadow (Android)
    elevation: 4,
  },
})
export default ChefAboutTab;
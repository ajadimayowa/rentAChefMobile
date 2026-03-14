// app/(tabs)/guest-chefs.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";
import { SafeAreaView } from "react-native-safe-area-context";
import ReusableCard from "@/components/cards/ReusableCard";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import SecureStorage from "@/store/secureStore";
import BodyText from "@/components/typography/BodyText";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";
import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import ReusableButton from "@/components/buttons/ReusableButton";
import AuthModal from "@/components/AuthModal";
import ChangeProfilePicModal from "@/components/modals/profile/ChangeProfilePicModal";
import UpdatePersonalInfoModal from "@/components/modals/profile/UpdatePersonalInfoModal";
import UpdateHealthInfoModal from "@/components/modals/profile/UpdateHealthInfoModal";
import UpdateAddressInfoModal from "@/components/modals/profile/UpdateAddressInfoModal";
import UpdateNOKInfoModal from "@/components/modals/profile/UpdateNOKInfoModal";

export default function ViewProfile() {
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IUser>();

  const [updatePicModal, setUpdatePicModal] = useState(false);
  const [updatePersonalInfoModal, setUpdatePersonalInfoModal] = useState(false);
  const [updateHealthInfoModal, setUpdateHealthInfoModal] = useState(false);
  const [updateAddressInfoModal, setUpdateAddressInfoModal] = useState(false);
  const [updateNokModal, setUpdateNokModal] = useState(false);



  const fetchUserProfile = async () => {
    // const apiUrl = Constants.expoConfig?.extra?.apiUrl
    // console.log('baseUrl',apiUrl)
    setLoading(true)
    try {
      const res = await api.get(`/user/${userProfile.id}`)
      console.log({ seeRes: res?.data?.payload })
      if (res?.data?.success) {
        setUserData(res?.data?.payload)
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
        text2: error?.response?.message || 'Error fetching chefs',
      });
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleLogout = async () => {
    await persistor.purge();
    router.replace('/authscreen')

  }
  return (
    <>
      <SafeAreaView style={styles.frame}>
        <ScrollView refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchUserProfile} />
        } style={styles.container}>
          <View style={{width:'100%', alignItems:'center'}}>
            {userData?.profilePic ? <Image source={{ uri: userData?.profilePic as any }} style={{ width: 300, height: 300, borderRadius:350 }} /> : <View>{userData?.gender == 'm' ? <Image source={require('../assets/images/manavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} /> : <Image source={require('../assets/images/womanavatar.png')} style={{ width: 100, height: 100, borderRadius: 100 }} />}</View>}
          </View>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setUpdatePicModal(true)}>
              <FontAwesome size={18} color={'#52220aff'} name="edit" />
            </TouchableOpacity>
          </View>


          <ReusableCard>
            <View>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionText text={"Personal Information"} />
                <TouchableOpacity onPress={() => setUpdatePersonalInfoModal(true)}>
                  <FontAwesome size={18} color={'#52220aff'} name="edit" />
                </TouchableOpacity>
              </View>

              <SectionText text="Fullname" />
              <BodyText text={userProfile?.fullName} />

              <SectionText textStyle={{ marginTop: 5 }} text="Gender" />
              <BodyText text={userData?.gender == 'm' ? 'Male' : 'Female'} />

              <SectionText textStyle={{ marginTop: 5 }} text="Contact" />
              <BodyText text={`0${userData?.phone} | ${userData?.email}`} />

              <SectionText textStyle={{ marginTop: 5 }} text="Birthday" />
              <BodyText text={`${userData?.dob?.toLocaleString() ?? '-'}`} />

              <SectionText textStyle={{ marginTop: 5 }} text="Marital Status" />
              <BodyText text={`${userData?.maritalStatus ?? '-'}`} />
            </View>




          </ReusableCard>
          <ReusableCard>
            <View>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionText text={"Health Information"} />
                <TouchableOpacity onPress={() => setUpdateHealthInfoModal(true)}>
                  <FontAwesome size={18} color={'#52220aff'} name="edit" />
                </TouchableOpacity>
              </View>

              <SectionText text="Allegies" />
              <View style={{ flexDirection: 'row', gap: 5, marginBottom: 15 }}>
                {
                  userData?.healthInformation?.allergies.map((alleg, index) => (<View key={index}><BodyText text={`${alleg},`} /></View>))
                }
              </View>


              <SectionText text="Brief description" />
              <BodyText text={userData?.healthInformation?.healthDetails ?? '-'} />
            </View>

            {/* <TouchableOpacity style={{width:'100%',flexDirection:'row', marginTop:30, justifyContent:'space-between', alignItems:'center'}}>
            <BodyText textStyle={{color:'#52220aff'}} text={"See More"}/>
            <Text><FontAwesome5 color={'#52220aff'}  name="angle-right"/></Text></TouchableOpacity> */}


          </ReusableCard>

          <ReusableCard>
            <View>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionText text={"Address Information"} />
                <TouchableOpacity onPress={() => setUpdateAddressInfoModal(true)}>
                  <FontAwesome size={18} color={'#52220aff'} name="edit" />
                </TouchableOpacity>
              </View>

              <SectionText text="Location" />
              <BodyText text={`${userData?.location?.city ?? '-'} | ${userData?.location?.state ?? '-'}`} />

              <SectionText text="Home address" />
              <BodyText text={`${userData?.location?.home ?? '-'} | ${userData?.location?.state ?? '-'}`} />
            </View>



          </ReusableCard>

          <ReusableCard>
            <View>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionText text={"NOK Information"} />
                <TouchableOpacity onPress={() => setUpdateNokModal(true)}>
                  <FontAwesome size={18} color={'#52220aff'} name="edit" />
                </TouchableOpacity>
              </View>

              <SectionText text="Fullname" />
              <BodyText text={userData?.nok?.fullName ?? '-'} />

              <SectionText textStyle={{ marginTop: 5 }} text="Relationship" />
              <BodyText text={userData?.nok?.relationship ?? '-'} />

              <SectionText textStyle={{ marginTop: 5 }} text="Contact" />
              <BodyText text={`0${userData?.nok?.phone ?? '-'}`} />

              {/* <SectionText textStyle={{ marginTop: 5 }} text="Health information" />
            <BodyText text={userProfile?.healthInfo ?? '-'} />

            <SectionText textStyle={{ marginTop: 5 }} text="Allergies" />
            <BodyText text={userProfile?.allergies ?? '-'} /> */}
            </View>

            {/* <TouchableOpacity style={{width:'100%',flexDirection:'row', marginTop:30, justifyContent:'space-between', alignItems:'center'}}>
            <BodyText textStyle={{color:'#52220aff'}} text={"See More"}/>
            <Text><FontAwesome5 color={'#52220aff'}  name="angle-right"/></Text></TouchableOpacity> */}


          </ReusableCard>

          <ScrollView contentContainerStyle={{ padding: 20 }}>

          </ScrollView>

        </ScrollView>

      </SafeAreaView>
      <ChangeProfilePicModal visible={updatePicModal} onClose={() => setUpdatePicModal(false)} />
      <UpdatePersonalInfoModal visible={updatePersonalInfoModal} onClose={() => setUpdatePersonalInfoModal(false)} />
      <UpdateHealthInfoModal visible={updateHealthInfoModal} onClose={() => setUpdateHealthInfoModal(false)} />
      <UpdateAddressInfoModal visible={updateAddressInfoModal} onClose={() => setUpdateAddressInfoModal(false)} />
        <UpdateNOKInfoModal visible={updateNokModal} onClose={() => setUpdateNokModal(false)} />
    </>
  );
}

const styles = ScaledSheet.create({
  frame: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    padding: '2%',
  },
});
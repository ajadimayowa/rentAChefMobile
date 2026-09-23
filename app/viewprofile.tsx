import React, { useCallback, useState } from "react";
import { View, ScrollView, Image, Text, TouchableOpacity, RefreshControl, KeyboardAvoidingView, Platform} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChangeProfilePicModal from "@/components/modals/profile/ChangeProfilePicModal";
import moment from "moment";
import PrimaryLoader from "@/components/Loader";
import ReusableButton from "@/components/buttons/ReusableButton";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function ViewProfile() {
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IUser>();

  const [updatePicModal, setUpdatePicModal] = useState(false);
  const router = useRouter()

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user/${userProfile.id}`);
      if (res?.data?.success) {
        setUserData(res?.data?.payload);
      } else {
        Toast.show({
          type: "error",
          text1: "Network error",
          text2: res?.data?.message || "Something went wrong!",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error?.response?.message || "Error fetching chefs",
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [userProfile?.id])
  );

  const formatValue = (value?: string | null) => (value && value.trim().length ? value : "-");
  const allergies = userData?.customerDetails?.healthInformation?.allergies || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {loading ? (
        <PrimaryLoader />
      ) :
        <>
          <ScrollView
            contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUserProfile} />}
          >
           
            <View style={styles.heroCard}>
               <SafeAreaView style={styles.safeArea}>
                      <ReusableButton
                        style={{ width: 100 }}
                        onPress={() => router.back()}
                        iconLeft={"chevron-back"}
                        extStyle={{ width: "50%", padding: 0, color: "#000" }}
                        type="pressableText"
                        title="Go Back"
                      />
                    </SafeAreaView>
              <View style={styles.heroGlowTop} />
              <View style={styles.heroGlowBottom} />

              <View style={styles.avatarContainer}>
                {userData?.profilePic ? (
                  <Image source={{ uri: userData.profilePic }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Ionicons name="person" size={48} color="#B8A98C" />
                  </View>
                )}
                <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setUpdatePicModal(true)}>
                  <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* <View style={styles.memberBadge}>
                <FontAwesome6 name="sparkles" size={11} color="#916017" />
                <Text style={styles.memberBadgeText}>Premium Profile</Text>
              </View> */}

              <Text style={styles.nameText}>{formatValue(userProfile?.fullName)}</Text>
              <Text style={styles.emailText}>{formatValue(userData?.email)}</Text>

              <View style={styles.quickFactsWrap}>
                <View style={styles.quickFactChip}>
                  <Ionicons name="call-outline" size={15} color="#6E4B23" />
                  <Text style={styles.quickFactText}>{formatValue(userData?.phoneNumber)}</Text>
                </View>
                <View style={styles.quickFactChip}>
                  <Ionicons name="location-outline" size={15} color="#6E4B23" />
                  <Text style={styles.quickFactText}>{formatValue(userData?.address?.city)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.titleIconCircle, { backgroundColor: "#F4EBDD" }]}>
                    <Ionicons name="person-outline" size={17} color="#5D3C17" />
                  </View>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: "/editUserProfile", params: { section: "personal" } })}>
                  <MaterialCommunityIcons name="pencil-outline" size={17} color="#5D3C17" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-circle-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Fullname</Text>
                <Text style={styles.infoValue}>{formatValue(userProfile?.fullName)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="male-female-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{userData?.gender === "Male" ? "Male" : "Female"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{`${formatValue(userData?.phoneNumber)} | ${formatValue(userData?.email)}`}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Birthday</Text>
                <Text style={styles.infoValue}>{userData?.dob ? moment(userData?.dob).format("DD-MM-YYYY") : "-"}</Text>
              </View>
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <Ionicons name="heart-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Marital Status</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.maritalStatus)}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.titleIconCircle, { backgroundColor: "#E7F3EA" }]}>
                    <MaterialCommunityIcons name="heart-pulse" size={17} color="#2E5D49" />
                  </View>
                  <Text style={styles.sectionTitle}>Health Information</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: "/editUserProfile", params: { section: "health" } })}>
                  <MaterialCommunityIcons name="pencil-outline" size={17} color="#2E5D49" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRowColumn}>
                <Text style={styles.infoLabelColumn}>Allergies</Text>
                <View style={styles.tagWrap}>
                  {allergies.length ? (
                    allergies.map((item, index) => (
                      <View key={`${item}-${index}`} style={styles.tagPill}>
                        <Text style={styles.tagText}>{item}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.infoValue}>-</Text>
                  )}
                </View>
              </View>
              <View style={[styles.infoRowColumn, styles.lastInfoRowColumn]}>
                <Text style={styles.infoLabelColumn}>Brief Description</Text>
                <Text style={styles.infoParagraph}>{formatValue(userData?.customerDetails?.healthInformation?.healthDetails)}</Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.titleIconCircle, { backgroundColor: "#E5EEF8" }]}>
                    <Ionicons name="location-outline" size={17} color="#1F456E" />
                  </View>
                  <Text style={styles.sectionTitle}>Address Information</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: "/editUserProfile", params: { section: "address" } })}>
                  <MaterialCommunityIcons name="pencil-outline" size={17} color="#1F456E" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="map-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>State</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.address?.stateName)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.address?.city)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="home-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Home Address</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.address?.homeAddress)}</Text>
              </View>
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <Ionicons name="briefcase-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Office Address</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.address?.officeAddress)}</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, styles.lastSectionCard]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.titleIconCircle, { backgroundColor: "#F1E7F6" }]}>
                    <Ionicons name="people-outline" size={17} color="#5B3A78" />
                  </View>
                  <Text style={styles.sectionTitle}>NOK Information</Text>
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: "/editUserProfile", params: { section: "nok" } })}>
                  <MaterialCommunityIcons name="pencil-outline" size={17} color="#5B3A78" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Fullname</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.nok?.fullName)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="link-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Relationship</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.nok?.relationship)}</Text>
              </View>
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <Ionicons name="call-outline" size={16} color="#8A7B6A" />
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{formatValue(userData?.nok?.phone)}</Text>
              </View>
            </View>
          </ScrollView>
          <ChangeProfilePicModal visible={updatePicModal} onClose={() => setUpdatePicModal(false)} />
        </>
      }
    </KeyboardAvoidingView>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EE",
  },
  safeArea: {
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: "14@ms",
    paddingBottom: "28@ms",
    gap: "12@ms",
  },
  heroCard: {
    backgroundColor: "#FFF7EB",
    borderWidth: 1,
    borderColor: "#F1E3CD",
    paddingVertical: "20@ms",
    paddingHorizontal: "16@ms",
    alignItems: "center",
    overflow: "hidden",
  },
  heroGlowTop: {
    position: "absolute",
    top: "-20@ms",
    right: "-12@ms",
    width: "110@ms",
    height: "110@ms",
    borderRadius: "110@ms",
    backgroundColor: "#F6EADA",
  },
  heroGlowBottom: {
    position: "absolute",
    bottom: "-38@ms",
    left: "-28@ms",
    width: "130@ms",
    height: "130@ms",
    borderRadius: "130@ms",
    backgroundColor: "#FAEFE0",
  },
  avatarContainer: {
    position: "relative",
    borderRadius: "999@ms",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#8C7358",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatar: {
    width: "104@ms",
    height: "104@ms",
    borderRadius: "999@ms",
    backgroundColor: "#FFFFFF",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1ECE6",
  },
  editAvatarBtn: {
    position: "absolute",
    right: "-2@ms",
    bottom: "-2@ms",
    width: "32@ms",
    height: "32@ms",
    borderRadius: "16@ms",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E5D49",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberBadge: {
    marginTop: "12@ms",
    flexDirection: "row",
    alignItems: "center",
    gap: "5@ms",
    backgroundColor: "#F7E9CE",
    borderWidth: 1,
    borderColor: "#E8D0A9",
    borderRadius: "999@ms",
    paddingHorizontal: "10@ms",
    paddingVertical: "4@ms",
  },
  memberBadgeText: {
    color: "#916017",
    fontWeight: "700",
    fontSize: "11@ms",
  },
  nameText: {
    marginTop: "10@ms",
    color: "#2C1D12",
    fontSize: "20@ms",
    fontWeight: "700",
    textAlign: "center",
  },
  emailText: {
    marginTop: "3@ms",
    color: "#6B625A",
    fontSize: "13@ms",
    textAlign: "center",
  },
  quickFactsWrap: {
    marginTop: "14@ms",
    width: "100%",
    flexDirection: "row",
    gap: "10@ms",
  },
  quickFactChip: {
    flex: 1,
    borderRadius: "14@ms",
    borderWidth: 1,
    borderColor: "#EADBCA",
    backgroundColor: "#FFFFFF",
    paddingVertical: "10@ms",
    paddingHorizontal: "8@ms",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "6@ms",
  },
  quickFactText: {
    color: "#6E4B23",
    fontSize: "12@ms",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "18@ms",
    borderWidth: 1,
    borderColor: "#EFE3D7",
    paddingHorizontal: "12@ms",
    paddingVertical: "12@ms",
  },
  lastSectionCard: {
    marginBottom: "2@ms",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8@ms",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: "8@ms",
  },
  titleIconCircle: {
    width: "30@ms",
    height: "30@ms",
    borderRadius: "10@ms",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#2C241B",
    fontWeight: "700",
    fontSize: "14@ms",
  },
  editBtn: {
    width: "30@ms",
    height: "30@ms",
    borderRadius: "10@ms",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F1E8",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "10@ms",
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE6",
    gap: "7@ms",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: "#847564",
    fontSize: "12@ms",
    fontWeight: "600",
    minWidth: "88@ms",
  },
  infoValue: {
    flex: 1,
    color: "#382C20",
    fontSize: "12@ms",
    fontWeight: "600",
    textAlign: "right",
  },
  infoRowColumn: {
    paddingVertical: "10@ms",
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE6",
  },
  lastInfoRowColumn: {
    borderBottomWidth: 0,
  },
  infoLabelColumn: {
    color: "#847564",
    fontSize: "12@ms",
    fontWeight: "700",
    marginBottom: "8@ms",
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "8@ms",
  },
  tagPill: {
    borderRadius: "999@ms",
    backgroundColor: "#FFF6EA",
    borderWidth: 1,
    borderColor: "#F2DEC2",
    paddingHorizontal: "10@ms",
    paddingVertical: "6@ms",
  },
  tagText: {
    color: "#7A5427",
    fontSize: "11@ms",
    fontWeight: "600",
  },
  infoParagraph: {
    color: "#382C20",
    fontSize: "12@ms",
    lineHeight: "18@ms",
  },
});

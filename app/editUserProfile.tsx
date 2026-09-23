import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "@/store";
import api from "@/services/apiConfig";
import { IUser } from "@/interfaces/user";
import FormInput from "@/components/FormInput";
import ReusableButton from "@/components/buttons/ReusableButton";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import ListPickerModal from "@/components/modals/calendar/ListPickerModal";
import DatePickerModal from "@/components/modals/calendar/DatePickerModal";
import PrimaryLoader from "@/components/Loader";
import useLocation from "@/hooks/useLocation";

type SectionKey = "personal" | "health" | "address" | "nok";

type ListPickerField = "gender" | "maritalStatus" | "state" | "city" | "relationship";

interface IState {
  id: number;
  state: string;
  localGovernmentAreas: string[];
}

const LIST_PICKER_TITLES: Record<ListPickerField, string> = {
  gender: "Select Gender",
  maritalStatus: "Select Marital Status",
  state: "Select State",
  city: "Select City",
  relationship: "Select Relationship",
};

const STATIC_LIST_PICKER_OPTIONS: Record<Exclude<ListPickerField, "state" | "city">, string[]> = {
  gender: ["Male", "Female"],
  maritalStatus: ["Single", "Married", "Divorced", "Widowed"],
  relationship: ["Husband", "Wife", "Sibling", "Father", "Mother"],
};

const SECTION_META: Record<SectionKey, { title: string; iconBg: string; icon: (color: string) => React.ReactNode }> = {
  personal: {
    title: "Personal Information",
    iconBg: "#F4EBDD",
    icon: (color) => <Ionicons name="person-outline" size={17} color={color} />,
  },
  health: {
    title: "Health Information",
    iconBg: "#E7F3EA",
    icon: (color) => <MaterialCommunityIcons name="heart-pulse" size={17} color={color} />,
  },
  address: {
    title: "Address Information",
    iconBg: "#E5EEF8",
    icon: (color) => <Ionicons name="location-outline" size={17} color={color} />,
  },
  nok: {
    title: "Next of Kin",
    iconBg: "#F1E7F6",
    icon: (color) => <Ionicons name="people-outline" size={17} color={color} />,
  },
};

const SECTION_ACCENT: Record<SectionKey, string> = {
  personal: "#5D3C17",
  health: "#2E5D49",
  address: "#1F456E",
  nok: "#5B3A78",
};

const PersonalSchema = Yup.object().shape({
  fullName: Yup.string().trim().min(3, "Full name must be at least 3 characters").required("Full name is required"),
  gender: Yup.string().required("Gender is required"),
  phoneNumber: Yup.string()
    .matches(/^\d+$/, "Phone number must contain only digits")
    .min(8, "Phone number must be at least 8 digits")
    .required("Phone number is required"),
  dob: Yup.string().required("Date of birth is required"),
  maritalStatus: Yup.string().required("Marital status is required"),
});

const HealthSchema = Yup.object().shape({
  healthDetails: Yup.string().trim().min(3, "Description must be at least 3 characters").required("Description is required"),
  allergies: Yup.string().required("Allergies is required"),
});

const AddressSchema = Yup.object().shape({
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
});

const NokSchema = Yup.object().shape({
  fullName: Yup.string().trim().min(3, "Full name must be at least 3 characters").required("Full name is required"),
  relationship: Yup.string().required("Relationship is required"),
  phone: Yup.string()
    .matches(/^\d+$/, "Phone number must contain only digits")
    .min(8, "Phone number must be at least 8 digits")
    .required("Phone number is required"),
});

export default function EditUserProfile() {
  const params = useLocalSearchParams<{ section?: string }>();
  const sectionKey: SectionKey = (params.section as SectionKey) in SECTION_META ? (params.section as SectionKey) : "personal";
  const meta = SECTION_META[sectionKey];
  const accent = SECTION_ACCENT[sectionKey];

  const router = useRouter();
  const userProfile = useSelector((state: RootState) => state.auth.bioData);
  const { long, lat } = useLocation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<IUser>();
  const [activeListPicker, setActiveListPicker] = useState<ListPickerField | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const res = await api.get("/states/get-states");
      if (res?.data?.success) {
        setStates(res?.data?.payload || []);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not load states",
        text2: "Pull down to try again.",
      });
    } finally {
      setLoadingStates(false);
    }
  };

  useEffect(() => {
    if (sectionKey === "address" && states.length === 0) {
      fetchStates();
    }
  }, [sectionKey]);

  const getListPickerOptions = (field: ListPickerField | null, currentState?: string): string[] => {
    if (!field) return [];
    if (field === "state") return states.map((item) => item.state);
    if (field === "city") return states.find((item) => item.state === currentState)?.localGovernmentAreas || [];
    return STATIC_LIST_PICKER_OPTIONS[field];
  };

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
        text1: "Error",
        text2: error?.response?.message || "Error fetching profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userProfile?.id]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      let res;
      if (sectionKey === "personal") {
        res = await api.put(`/user/updateBiodata/${userProfile.id}`, values);
      } else if (sectionKey === "health") {
        res = await api.put(`/user/updateHealthInformation/${userProfile.id}`, {
          healthDetails: values.healthDetails,
          allergies: [values.allergies],
        });
      } else if (sectionKey === "address") {
        res = await api.put(`/user/updateLocation/${userProfile.id}`, values);
      } else {
        res = await api.put(`/user/updateNok/${userProfile.id}`, values);
      }

      if (res?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: res?.data?.message || "Update failed",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitialValues = () => {
    switch (sectionKey) {
      case "personal":
        return {
          fullName: userData?.fullName || "",
          gender: userData?.gender || "",
          phoneNumber: userData?.phoneNumber || "",
          dob: userData?.dob ? new Date(userData.dob).toISOString() : "",
          maritalStatus: userData?.maritalStatus || "",
        };
      case "health":
        return {
          healthDetails: userData?.customerDetails?.healthInformation?.healthDetails || "",
          allergies: userData?.customerDetails?.healthInformation?.allergies?.[0] || "",
        };
      case "address":
        return {
          home: userData?.address?.homeAddress || "",
          office: userData?.address?.officeAddress || "",
          state: userData?.address?.stateName || "",
          city: userData?.address?.city || "",
          long: long ?? userData?.address?.long ?? "",
          lat: lat ?? userData?.address?.lat ?? "",
        };
      case "nok":
        return {
          fullName: userData?.nok?.fullName || "",
          relationship: userData?.nok?.relationship || "",
          phone: userData?.nok?.phone || "",
        };
    }
  };

  const getSchema = () => {
    switch (sectionKey) {
      case "personal":
        return PersonalSchema;
      case "health":
        return HealthSchema;
      case "address":
        return AddressSchema;
      case "nok":
        return NokSchema;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#2C241B" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={[styles.titleIconCircle, { backgroundColor: meta.iconBg }]}>{meta.icon(accent)}</View>
            <Text style={styles.headerTitle}>{meta.title}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {loading ? (
        <PrimaryLoader />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <Formik initialValues={getInitialValues()} enableReinitialize validationSchema={getSchema()} onSubmit={handleSave}>
                {({ handleSubmit, values, setFieldValue }) => (
                  <>
                    {sectionKey === "personal" && (
                      <>
                        <FormInput id="fullName" label="Full Name" placeholder="Full name" />
                        <FormInput id="phoneNumber" label="Phone Number" type="number" placeholder="Phone number" />
                        <SelectActionButton
                          label="Gender"
                          value={values.gender}
                          onPress={() => setActiveListPicker("gender")}
                        />
                        <SelectActionButton
                          label="Marital Status"
                          value={values.maritalStatus}
                          onPress={() => setActiveListPicker("maritalStatus")}
                        />
                        <SelectActionButton
                          label="Date of Birth"
                          value={values.dob ? new Date(values.dob).toDateString() : undefined}
                          onPress={() => setShowDobPicker(true)}
                        />
                      </>
                    )}

                    {sectionKey === "health" && (
                      <>
                        <FormInput type="textarea" id="healthDetails" label="Health information" placeholder="Enter a brief description" />
                        <FormInput id="allergies" label="Enter allergy" placeholder="i.e wallnut" />
                      </>
                    )}

                    {sectionKey === "address" && (
                      <>
                        <FormInput type="textarea" id="home" label="Home Address" placeholder="Enter home address" />
                        <FormInput type="textarea" id="office" label="Office Address" placeholder="Enter office address" />
                        <SelectActionButton
                          label="State"
                          value={loadingStates ? "Loading states..." : values.state}
                          disabled={loadingStates}
                          onPress={() => setActiveListPicker("state")}
                        />
                        {values.state && (
                          <SelectActionButton
                            label="City"
                            value={values.city}
                            onPress={() => setActiveListPicker("city")}
                          />
                        )}
                      </>
                    )}

                    {sectionKey === "nok" && (
                      <>
                        <FormInput id="fullName" label="Full Name" placeholder="Full name" />
                        <FormInput id="phone" label="Phone Number" type="number" placeholder="Phone number" />
                        <SelectActionButton
                          label="Relationship"
                          value={values.relationship}
                          onPress={() => setActiveListPicker("relationship")}
                        />
                      </>
                    )}

                    <ReusableButton style={{ marginTop: 20 }} onPress={handleSubmit} loading={saving} title="Save Changes" />

                    <ListPickerModal
                      visible={activeListPicker !== null}
                      onClose={() => setActiveListPicker(null)}
                      title={activeListPicker ? LIST_PICKER_TITLES[activeListPicker] : undefined}
                      options={getListPickerOptions(activeListPicker, values.state)}
                      onSelect={(selected) => {
                        if (activeListPicker === "state" && selected !== values.state) {
                          setFieldValue("city", "");
                        }
                        if (activeListPicker) {
                          setFieldValue(activeListPicker, selected);
                        }
                        setActiveListPicker(null);
                      }}
                    />

                    <DatePickerModal
                      visible={showDobPicker}
                      onClose={() => setShowDobPicker(false)}
                      title="Select Date of Birth"
                      selectedDate={values.dob ? new Date(values.dob) : undefined}
                      maxDate={new Date().toISOString().split("T")[0]}
                      onSelectDate={(date) => setFieldValue("dob", date.toISOString())}
                    />
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EE",
  },
  safeArea: {
    backgroundColor: "#F8F4EE",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "14@ms",
    paddingVertical: "10@ms",
  },
  backBtn: {
    width: "36@ms",
    height: "36@ms",
    borderRadius: "12@ms",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFE3D7",
  },
  headerSpacer: {
    width: "36@ms",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: "8@ms",
  },
  titleIconCircle: {
    width: "28@ms",
    height: "28@ms",
    borderRadius: "10@ms",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#2C241B",
    fontWeight: "700",
    fontSize: "15@ms",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: "14@ms",
    paddingBottom: "28@ms",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "18@ms",
    borderWidth: 1,
    borderColor: "#EFE3D7",
    paddingHorizontal: "14@ms",
    paddingVertical: "16@ms",
  },
});

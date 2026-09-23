import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";

interface ProfileEditSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}

const ProfileEditSheet: React.FC<ProfileEditSheetProps> = ({
  visible,
  onClose,
  title,
  icon,
  iconBg,
  children,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheetContainer}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.grabber} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>
                <Text style={styles.title}>{title}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={18} color="#847564" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={{ paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20,15,10,0.45)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    ...({ position: "absolute" } as const),
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    width: "100%",
  },
  sheet: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    paddingHorizontal: "18@ms",
    paddingTop: "10@ms",
  },
  grabber: {
    alignSelf: "center",
    width: "36@ms",
    height: "4@ms",
    borderRadius: "999@ms",
    backgroundColor: "#E4DACB",
    marginBottom: "14@ms",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "14@ms",
    marginBottom: "14@ms",
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: "8@ms",
  },
  iconCircle: {
    width: "32@ms",
    height: "32@ms",
    borderRadius: "10@ms",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#2C241B",
    fontWeight: "700",
    fontSize: "15@ms",
  },
  closeBtn: {
    width: "30@ms",
    height: "30@ms",
    borderRadius: "10@ms",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F1E8",
  },
  body: {
    width: "100%",
  },
});

export default ProfileEditSheet;

import React from "react";
import { Modal, View, ScrollView, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { Card, IconButton, Text, ActivityIndicator } from "react-native-paper";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import FrameCard from "@/components/cards/FrameCard";
import ListCardWithIconAndNavigation from "@/components/cards/ListCardWithIconAndNavigation";

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  services: any[];
  loading?: boolean;
  onSelectService: (service: any) => void;
}

const resolveIoniconName = (iconName?: string): string => {
  const normalized = String(iconName || "").trim().toLowerCase();

  switch (normalized) {
    case "ballon":
      return "balloon";
    case "":
      return "restaurant";
    default:
      return normalized;
  }
};


const ServiceCategoryServicesModal: React.FC<Props> = ({ visible, onClose, title, services, loading, onSelectService }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <SectionText text={title} />

            <IconButton
              icon="close"
              onPress={onClose}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading services...</Text>
              </View>
            )}

            {!loading && services.length === 0 && (
              <BodyText
                text="No services found in this category."
              />
            )}

            <FrameCard style={styles.cardList}>
              {!loading && services.map((service, index) => (
                <Pressable
                  key={service?.id || service?._id || index}
                  onPress={() => onSelectService(service)}
                >
                  <ListCardWithIconAndNavigation
                    data={service}
                    showIcon={true}
                    showDescription={true}
                  />
                </Pressable>
              ))}
            </FrameCard>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {

    backgroundColor: "#FFF",
    borderTopLeftRadius: "20@ms",
    borderTopRightRadius: "20@ms",
    padding: "10@ms",
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: { marginTop: "12@vs" },
  cardList: {
    width: "100%",
    gap: "10@s",
  },
  
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "#666" },
});

export default ServiceCategoryServicesModal;

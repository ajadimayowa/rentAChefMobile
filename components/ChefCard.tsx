// components/ChefCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import BodyText from "./typography/BodyText";
import { formatListWithEllipsis } from "@/helpers/utils";
import { router } from "expo-router";
import SectionText from "./typography/SectionText";
import { IChef } from "@/interfaces/chef";

interface ChefCardProps {
  chef: IChef
}

const ChefCard: React.FC<ChefCardProps> = ({ chef }) => {
  const handleViewProfile = () => {
    router.push({
      pathname: "/viewchefinfo",
      params: { id: chef?.id, chefPic: chef?.profilePic, chefName: chef?.fullName },
    });
  };

  const locationText = [chef?.address?.city, chef?.address?.stateName].filter(Boolean).join(", ");
  const specialties = formatListWithEllipsis(chef?.chefDetails?.specialties ?? [], 3);
  const chefLevelName = typeof chef?.chefDetails?.chefLevel === "string"
    ? undefined
    : chef?.chefDetails?.chefLevel?.name;

  return (
    <TouchableOpacity onPress={handleViewProfile} style={styles.card} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Image
          source={
            chef?.profilePic
              ? { uri: chef?.profilePic }
              : require("../assets/images/chefAvatar.jpg")
          }
          style={styles.image}
        />
        <View style={styles.avatarBadge}>
          <Ionicons name="sparkles" size={12} color="#F08A5D" />
          <Text style={styles.avatarBadgeText}>Top Chef</Text>
        </View>
      </View>

      <View style={styles.info}>
        <SectionText
          text={chef?.fullName || "Chef"}
          textStyle={{
            fontSize: 15,
            color: "#221914",
            marginBottom: 6,
          }}
        />

        <View style={styles.metaRow}>
          <View style={styles.iconBubble}>
            <Ionicons name="location" size={13} color="#1E824C" />
          </View>
          <BodyText
            text={locationText || "Location not available"}
            textStyle={{
              color: "#5D5A56",
              fontSize: 13,
              lineHeight: 18,
              flexShrink: 1,
            }}
          />
        </View>

        <View style={styles.detailChip}>
          <Ionicons name="restaurant" size={14} color="#A1411F" />
          <BodyText
            text={specialties || "Specialties coming soon"}
            textStyle={{
              color: "#514A43",
              fontSize: 12,
              marginLeft: 7,
              flex: 1,
            }}
          />
        </View>

        <View style={styles.detailChip}>
          <Ionicons name="ribbon" size={14} color="#1E6EAF" />
          <BodyText
            text={chefLevelName || "General Chef"}
            textStyle={{
              color: "#514A43",
              fontSize: 12,
              marginLeft: 7,
              flex: 1,
            }}
          />
        </View>

        <TouchableOpacity onPress={handleViewProfile} style={styles.ctaRow} activeOpacity={0.8}>
          <Text style={styles.ctaText}>View profile</Text>
          <Ionicons name="arrow-forward-circle" size={18} color="#E2725B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: "11@s",
    marginVertical: "6@vs",
    borderWidth: 1,
    borderColor: "#F2E8DF",
    borderRadius: "5@s",
    backgroundColor: "#fff",
    shadowColor: "#e0dddd",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrap: {
    marginRight: "12@ms",
    position: "relative",
  },
  image: {
    width: "105@ms",
    height: "126@ms",
    borderRadius: "14@ms",
    borderWidth: 1,
    borderColor: "#F4E6D6",
  },
  avatarBadge: {
    position: "absolute",
    left: "8@ms",
    bottom: "8@ms",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "14@ms",
    paddingVertical: "3@vs",
    paddingHorizontal: "8@s",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBadgeText: {
    color: "#8A4D2A",
    fontSize: "10@s",
    marginLeft: "4@ms",
    fontFamily: "secondaryFont",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "7@vs",
  },
  iconBubble: {
    width: "22@ms",
    height: "22@ms",
    borderRadius: "11@ms",
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "7@ms",
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF4EE",
    borderRadius: "10@s",
    paddingVertical: "5@vs",
    paddingHorizontal: "8@s",
    marginBottom: "6@vs",
  },
  ctaRow: {
    marginTop: "2@vs",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  ctaText: {
    color: "#E2725B",
    marginRight: "6@ms",
    fontSize: "13@s",
    fontFamily: "secondaryFont",
  },
});

export default ChefCard;
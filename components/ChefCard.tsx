// components/ChefCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

interface ChefCardProps {
  image: any;
  name: string;
  location: string;
  onPress: () => void;
}

const ChefCard: React.FC<ChefCardProps> = ({ image, name, location, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={image} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.location}>{location}</Text>
    </View>
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: "10@s",
    marginVertical: "5@vs",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: "10@s",
    backgroundColor: "#fff",
  },
  image: { width: "50@s", height: "50@s", borderRadius: "25@s", marginRight: "10@s" },
  info: { flex: 1 },
  name: { fontWeight: "700", fontSize: "14@s", color: "#333" },
  location: { fontSize: "12@s", color: "#777" },
});

export default ChefCard;
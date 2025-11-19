// components/DishCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

interface DishCardProps {
  image: any;
  title: string;
  price: string;
  onPress: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ image, title, price, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={image} style={styles.image} />
    <View style={styles.details}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  card: { width: "150@s", marginRight: "10@s", borderRadius: "10@s", overflow: "hidden", backgroundColor: "#fff" },
  image: { width: "100%", height: "100@vs" },
  details: { padding: "8@s" },
  title: { fontWeight: "600", fontSize: "13@s", color: "#333" },
  price: { color: "#EA7052", fontWeight: "700", marginTop: "4@vs" },
});

export default DishCard;
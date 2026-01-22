// components/ChefCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import BodyText from "./typography/BodyText";
import ReusableButton from "./buttons/ReusableButton";
import Colors from "@/constants/Colors";
import { formatListWithEllipsis} from "@/helpers/utils";
import { router } from "expo-router";

interface ChefCardProps {
  image: any;
  name: string;
  location: string;
  state:string;
  specialty: string[],
  onPress: () => void;
}

const ChefCard: React.FC<ChefCardProps> = ({ image, name, location,state, specialty, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>

    <Image
  source={
    image
      ? { uri: image }
      : require("../assets/images/chefAvatar.jpg")
  }
  style={styles.image}
/>
    <View style={styles.info}>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
        <Ionicons name="location" size={17} color="#B7D2A4" />
        <BodyText text={location} />
        <BodyText text={','} />
        <BodyText text={state} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        
<Text> {formatListWithEllipsis(specialty ?? [], 3)}</Text>
      </View>
      <TouchableOpacity onPress={onPress} style={{ marginTop: 10, display: 'flex', gap: 5, flexDirection: 'row' }}>
        <Text style={{ color: '#E2725B'}}>View profile</Text>
        <Ionicons name="arrow-forward" size={16} color={'#E2725B'} />
      </TouchableOpacity>

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
  image: { width: "100@ms", height: "120@ms", borderRadius: "10@ms", marginRight: "10@ms" },
  info: { flex: 1 },
  name: { fontWeight: "700", fontSize: "14@s", color: "#333" },
  location: { fontSize: "12@s", color: "#777" },
});

export default ChefCard;
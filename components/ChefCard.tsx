// components/ChefCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import BodyText from "./typography/BodyText";
import ReusableButton from "./buttons/ReusableButton";
import Colors from "@/constants/Colors";

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

    <Image source={image} style={styles.image} />
    <View style={styles.info}>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
        <Ionicons name="location" size={17} color="#B7D2A4" />
        <BodyText text={location} />
        <BodyText text={','} />
        <BodyText text={state} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        {
          specialty?.map((sp: string,index) => <Text key={index}>{`${sp},`}</Text>)
        }
      </View>
      <BodyText text="+4 More" textStyle={{ fontSize: 14 }} />
      <TouchableOpacity style={{ marginTop: 10, display: 'flex', gap: 5, flexDirection: 'row' }}>
        <Text style={{ color: Colors.primary.base }}>View</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.primary.base} />
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
  image: { width: "100@s", height: "120@s", borderRadius: "10@s", marginRight: "10@s" },
  info: { flex: 1 },
  name: { fontWeight: "700", fontSize: "14@s", color: "#333" },
  location: { fontSize: "12@s", color: "#777" },
});

export default ChefCard;
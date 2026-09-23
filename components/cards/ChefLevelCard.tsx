import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";
import { convertToThousand } from "@/helpers/utils";

interface ChefLevelCardProps {
  data: {
    chefCatName: string;
    chefCatDesc: string;
    chefCatId: string;
    monthlySubFee: number;
    chefCatTasks: string[];
    numberOfDays: number;
    basePriceMinor: number;
    id: string;
    icon: ImageSourcePropType;
  };
  onPress?: (nextValue: { id: string; name: string; chefCatId: string; basePriceMinor: number }) => void;
  style?: StyleProp<ViewStyle>;
  showValue?: boolean;
  showDescription?: boolean;
}

const ChefLevelCard: React.FC<ChefLevelCardProps> = ({ data, style, showValue, showDescription, onPress }) => {


  return (
    <Pressable key={data.id} onPress={() => onPress?.({ id: data.id, name: data.chefCatName, chefCatId: data.chefCatId, basePriceMinor: data.basePriceMinor })} style={[styles.card, style]}>
      <Image
        source={data?.icon}
        style={{ width: 40, height: 40 }}
      />
      <View style={{ width: "90%",backgroundColor: 'transparent'}}>
        <View style={{ backgroundColor: 'transparent', flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
          <BodyText text={`From ${convertToThousand(data?.monthlySubFee || 0)}/mo`} textStyle={{ marginLeft: 10, color: '#2d227e' }} />
        </View>
        <View style={{ backgroundColor: 'transparent', flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <SectionText text={data?.chefCatName || ''} textStyle={{ marginLeft: 10 }} />
        </View>
        <BodyText text={data?.chefCatDesc || ''} textStyle={{ marginLeft: 10 }} />
        {
          data?.chefCatTasks?.length > 0 && 
          data?.chefCatTasks?.map((task, index) => (
            <View key={index} style={{ flexDirection: "row", gap:5, backgroundColor: 'transparent', alignItems: 'flex-start', marginLeft: 10, marginTop: 5, width: '90%' }}>
              <Ionicons name="checkmark-circle" size={12} color="#151415" />
              <BodyText text={task} textStyle={{ marginLeft: 5 }} />
            </View>
          ))
        }

        <View style={{ backgroundColor: 'transparent', flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <BodyText text={`${data?.numberOfDays} days testing`} textStyle={{ marginLeft: 10 }} />
          <BodyText text={`${convertToThousand(data?.basePriceMinor || 0)}`} textStyle={{ marginLeft: 10, color: '#2d227e' }} />
        </View>
      </View>
    </Pressable>);
};

const styles = ScaledSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    borderRadius: "10@ms",
    backgroundColor: "#F5F5F5",
    shadowColor: "#fff",
    overflow: "hidden",
    padding: "10@ms",
    marginBottom: "25@ms",


  }
});

export default ChefLevelCard;
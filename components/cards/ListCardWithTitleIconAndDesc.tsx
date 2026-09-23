import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";
import { convertToThousand, cutString } from "@/helpers/utils";

interface ListCardWithTitleIconAndDescProps {
  data: {
    id: string;
    name: string;
    value: string;
    description?: string;
  };
  style?: StyleProp<ViewStyle>;
  showValue?: boolean;
  showDescription?: boolean;
  onPress?: () => void;
}

const ListCardWithTitleIconAndDesc: React.FC<ListCardWithTitleIconAndDescProps> = ({ data, style, showValue, onPress, showDescription }) => {
 

  return (
  <Pressable onPress={onPress} style={[styles.card, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: 'transparent' }}>
      <View style={{ marginLeft: 5, backgroundColor: 'transparent'}}>
        <SectionText text={data?.name || ''} textStyle={{ marginLeft: 10 }} />
      {showDescription && <BodyText text={cutString(data?.description, 30) || ''} textStyle={{ marginLeft: 10 }} />}
      {showValue && <BodyText text={convertToThousand(data?.value) || ''} textStyle={{ marginLeft: 10 }} />}
      </View>
    </View>
        

  </Pressable>);
};

const styles = ScaledSheet.create({
  card: {
    height: "85@ms",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "10@ms",
    backgroundColor: "#F5F5F5",
    shadowColor: "#fff",
    overflow: "hidden",
    padding: "10@ms"

  }
});

export default ListCardWithTitleIconAndDesc;
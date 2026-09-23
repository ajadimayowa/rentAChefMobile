import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";

interface ListCardWithIconAndNavigationProps {
  data?: {
    id: string;
    value: string;
    name: string;
    icon: ImageSourcePropType;
    description?: string;
  };
  style?: StyleProp<ViewStyle>;
  showIcon?: boolean;
  showDescription?: boolean;
}

const ListCardWithIconAndNavigation: React.FC<ListCardWithIconAndNavigationProps> = ({ data, style, showIcon, showDescription }) => {
 

  return (
  <View style={[styles.card, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: 'transparent' }}>
      <Image
        source={data?.icon}
        style={{ width: 40, height: 40 }}
      />
      <View style={{ marginLeft: 5, backgroundColor: 'transparent' }}>
        <SectionText text={data?.name || ''} textStyle={{ marginLeft: 10 }} />
      {showDescription && <BodyText text={data?.description || ''} textStyle={{ marginLeft: 10 }} />}

      </View>
    </View>
        {showIcon && <Entypo name="chevron-small-right" size={24} />}

  </View>);
};

const styles = ScaledSheet.create({
  card: {
    height: "60@ms",
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

export default ListCardWithIconAndNavigation;
import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";
import { convertToThousand } from "@/helpers/utils";

interface ListCardWithIconAndNavigationProps {
  data: {
    name: string;
    value: string;
    icon: ImageSourcePropType;
    description?: string;
  };
  style?: StyleProp<ViewStyle>;
  showValue?: boolean;
  showDescription?: boolean;
}

const ListCardWithIconAndValueAtEnd: React.FC<ListCardWithIconAndNavigationProps> = ({ data, style, showValue, showDescription }) => {
 

  return (
  <View style={[styles.card, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: 'transparent' }}>
      <Image
        source={data?.icon}
        style={{ width: 40, height: 40 }}
      />
      <View style={{ marginLeft: 5, backgroundColor: 'transparent',maxWidth: 200 }}>
        <SectionText text={data?.name || ''} textStyle={{ marginLeft: 10 }} />
      {showDescription && <BodyText text={data?.description || ''} textStyle={{ marginLeft: 10 }} />}

      </View>
    </View>
        {showValue && <BodyText text={convertToThousand(data?.value) || ''} textStyle={{ marginLeft: 10 }} />}

  </View>);
};

const styles = ScaledSheet.create({
  card: {
    height: "85@ms",
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

export default ListCardWithIconAndValueAtEnd;
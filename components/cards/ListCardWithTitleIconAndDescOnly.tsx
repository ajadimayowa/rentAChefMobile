import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Entypo, Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";
import { convertToThousand, cutString } from "@/helpers/utils";

interface ListCardWithIconAndNavigationProps {
  data: {
    id: string;
    name: string;
    value?: string;
    icon?: ImageSourcePropType;
    description?: string;
  };
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  showDescription?: boolean;
  onPress?: () => void;
}

const ListCardWithTitleIconAndDescOnly: React.FC<ListCardWithIconAndNavigationProps> = ({ data, style,showIcon, onPress, showDescription }) => {
 

  return (
  <Pressable onPress={onPress} style={[styles.card, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: 'transparent' }}>
      {showIcon && data?.icon && (
        <Image
          source={data?.icon}
          style={{ width: 40, height: 40 }}
        />
      )}
      <View style={{ marginLeft: 5, backgroundColor: 'transparent'}}>
        <SectionText text={data?.name || ''} textStyle={{ marginLeft: 10 }} />
      {showDescription && <BodyText text={cutString(data?.description, 30) || ''} textStyle={{ marginLeft: 10 }} />}

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

export default ListCardWithTitleIconAndDescOnly;
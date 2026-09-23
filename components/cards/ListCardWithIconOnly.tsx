import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";

interface ListCardWithIconOnlyProps {
  data?: {
    value: string;
    label: string;
    count: number;
    icon: ImageSourcePropType;
  };
  style?: StyleProp<ViewStyle>;
  onIncrement?: (value: string) => void;
  onDecrement?: (value: string) => void;
}

const ListCardWithIconOnly: React.FC<ListCardWithIconOnlyProps> = ({ data, style, onIncrement, onDecrement }) => {
  const proteinKey = data?.value || "";
  const count = data?.count ?? 0;
  const canDecrement = count > 0;

  return (<View style={[styles.card, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: 'transparent' }}>
      <Image
        source={data?.icon}
        style={{ width: 20, height: 20 }}
      />
      <SectionText text={data?.label || ''} textStyle={{ marginLeft: 10 }} />
    </View>

    <View style={styles.counterStyle}>
      <SectionText text={String(count)} />
    </View>


  </View>);
};

const styles = ScaledSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "10@ms",
    padding: "10@ms",
    paddingVertical: "15@ms",
    margin: "5@ms",
    backgroundColor: "#F5F5F5",
    shadowColor: "#fff",
    overflow: "hidden",

  },
  counterStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    gap: 10,
  },
  counterTextStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f6a50ff",
    marginHorizontal: 10,
    textAlign: 'center',
    marginVertical: 5
  }
});

export default ListCardWithIconOnly;
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";

interface ListCardWithIconProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ListCardWithIcon: React.FC<ListCardWithIconProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = ScaledSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10@ms",
    borderRadius: "10@ms",
    padding: "10@ms",
    paddingVertical: "15@ms",
    margin: "5@ms",
    backgroundColor: "#fff",
    shadowColor: "#fff",
    overflow: "hidden",
  },
});

export default ListCardWithIcon;
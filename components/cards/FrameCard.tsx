import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";

interface FrameCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const FrameCard: React.FC<FrameCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = ScaledSheet.create({
  card: {
    borderRadius: "10@ms",
    padding: "10@ms",
    paddingVertical: "15@ms",
    margin: "5@ms",
    backgroundColor: "#fff",
    shadowColor: "#fff",
    overflow: "hidden",
  },
});

export default FrameCard;
import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import BodyText from "../typography/BodyText";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Section } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
import SectionText from "../typography/SectionText";

interface SelectActionButtonProps {
  label: string;
  value?: string | number;
  onPress: (event: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

const SelectActionButton: React.FC<SelectActionButtonProps> = ({
  label,
  value,
  onPress,
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <>
    <SectionText text={label} textStyle={{ fontSize: 16, fontWeight: '600', marginVertical:10 }} />
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
<BodyText text={value?`${value}`:"Select"} textStyle={textStyle}/>
<Entypo name="chevron-small-down" size={20} color="#000" style={styles.icon} />
    </TouchableOpacity>
    </>
  );
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: "10@ms",
    paddingVertical: "14@ms",
    paddingHorizontal: "16@ms",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: "8@ms",
  },
  title: {
    fontSize: "16@ms",
    fontWeight: "600",
    color: "#000000",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SelectActionButton;
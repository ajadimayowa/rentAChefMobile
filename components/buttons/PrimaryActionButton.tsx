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

interface PrimaryActionButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  title,
  onPress,
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
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
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}

<BodyText text={title} textStyle={textStyle}/>
      </View>
    </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

export default PrimaryActionButton;
import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  type?: "primary" | "secondary" | "outline" | "pressableText";
  onPress?: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  extStyle?: any;
  textStyle?: TextStyle;
  iconLeft?: string; // Ionicon name
  iconColor?:string;
  iconRight?: string; // Ionicon name
  icon?: React.ReactNode; // custom icon (e.g. from Feather, AntDesign)
}

const ReusableButton: React.FC<ButtonProps> = ({
  title,
  type = "primary",
  onPress,
  loading: externalLoading,
  disabled = false,
  style,
  extStyle,
  textStyle,
  iconLeft,
  iconRight,
  icon,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handlePress = async () => {
    try {
      if (onPress) {
        setInternalLoading(true);
        await onPress();
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const getButtonStyle = (): ViewStyle => {
    switch (type) {
      case "secondary":
        return { backgroundColor: Colors.primary.light };
      case "outline":
        return (
          extStyle || {
            backgroundColor: "transparent",
            borderWidth: moderateScale(1.5),
            borderColor: Colors.primary.base,
          }
        );
      case "pressableText":
        return { backgroundColor: "transparent",paddingVertical: 2, };
      default:
        return{ backgroundColor: Colors.primary.base };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (type) {
      case "outline":
        return { color: Colors.primary.base };
      case "pressableText":
        return { color: textStyle?.color };
      default:
        return { color: "#fff" };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.button,
        getButtonStyle(),
        disabled || isLoading ? { opacity: 0.6 } : {},
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View style={styles.content}>
          {/* Left Icon */}
          {iconLeft && (
            <Ionicons
              name={iconLeft as any}
              size={moderateScale(18)}
              color={getTextStyle().color}
              style={styles.leftIcon}
            />
          )}

          {/* Custom Icon */}
          {icon && <View style={styles.leftIcon}>{icon}</View>}

          {/* Text */}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>

          {/* Right Icon */}
          {iconRight && (
            <Ionicons
              name={iconRight as any}
              size={moderateScale(18)}
              color={getTextStyle().color}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ReusableButton;

const styles = ScaledSheet.create({
  button: {
    paddingVertical: "14@vs",
    borderRadius: "30@s",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap:4
  },
  text: {
    fontSize: "12@s",
    fontWeight: "600",
  },
  leftIcon: {
    marginRight: "8@s",
  },
  rightIcon: {
    marginLeft: "8@s",
  },
});

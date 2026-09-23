import { View } from "react-native";
import { Card } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";

interface IconWrapperProps {
  children?: React.ReactNode;
  size?: number;
  style?: object;
}

const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  size = 85,
  style,
}) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
        },
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = ScaledSheet.create({
  card: {
    backgroundColor: "#F5F5F5",
    margin: "10@ms",
  },
});

export default IconWrapper;
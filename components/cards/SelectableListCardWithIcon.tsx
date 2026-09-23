import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import BodyText from "../typography/BodyText";

interface ListCardWithIconProps {
  data: string;
  style?: StyleProp<ViewStyle>;
  key?: string;
  selected?: boolean;
}

const ListCardWithIcon: React.FC<ListCardWithIconProps> = ({ data, style,key,selected }) => {
  return (
    <Pressable
                            key={key}
                            // onPress={() => handleSelect(option)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                margin: 10,
                                padding: 12,
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: selected ? "#1f6a50ff" : "#E0E0E0",
                                backgroundColor: selected ? "#EAF8F2" : "#fff",
                            }}
                        >
                            <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: selected ? "#1f6a50ff" : "#999",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                                backgroundColor: "#fff",
                            }}>
                                {selected && (
                                    <View style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: "#1f6a50ff",
                                    }} />
                                )}
                            </View>
                            <BodyText text={data} />
                        </Pressable>
  )
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

export default ListCardWithIcon;
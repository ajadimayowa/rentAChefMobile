import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { View } from "../Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import BodyText from "../typography/BodyText";
import PrimaryActionButton from "../buttons/PrimaryActionButton";
import { getMenus } from "@/services/menuService";

interface ListCardWithIconAndNavigationProps {
  data: {
    id?: string;
    name: string;
    value: string;
    icon: string;
    description?: string;
    chefId?: string;
  };
  style?: StyleProp<ViewStyle>;
  showValue?: boolean;
  showToggle?: boolean;
  showDescription?: boolean;
  onPress?: () => void;
  selected?: boolean;
  isSignatureMenuOpen?: boolean;
  onToggleSignatureMenu?: () => void;
}

const ChefCardWithBioPicAndToggle: React.FC<
  ListCardWithIconAndNavigationProps
> = ({
  data,
  style,
  showValue,
  showDescription,
  showToggle,
  selected,
  isSignatureMenuOpen = false,
  onToggleSignatureMenu,
  onPress,
}) => {
    const [canFave, setCanFave] = useState(false);
    const [signatureMenu, setSignatureMenu] = useState<any[]>([]);
    const [loadingSignatureMenu, setLoadingSignatureMenu] = useState(false);
    const chefIdForMenu = String(data?.chefId || data?.id || "");

    useEffect(() => {
      const fetchSignatureMenu = async () => {
        if (!isSignatureMenuOpen) return;
        if (!chefIdForMenu) return;
        if (signatureMenu.length > 0) return;

        try {
          setLoadingSignatureMenu(true);

          const response = await getMenus({
            chefId: chefIdForMenu,
            isSignatureMenu: true,
          });
          const formated = response?.data?.data.map((item: any) => {
            return {
              id: item.id,
              name: item.title,
              description: item.description,
            };
          });
          setSignatureMenu(formated || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingSignatureMenu(false);
        }
      };

      fetchSignatureMenu();
    }, [chefIdForMenu, isSignatureMenuOpen, signatureMenu.length]);

    const handleCardPress = () => {
      onPress?.();
    };

    return (
      <Pressable onPress={handleCardPress}>
        <View
          style={[
            styles.card,
            selected && styles.selectedCard,
            style,
          ]}
        >
          <View style={styles.detailRow}>
            <View style={styles.leftSection}>
              <Image
                source={{ uri: data?.icon }}
                style={styles.avatar}
              />

              <View style={styles.textContainer}>
                <SectionText
                  text={data?.name || ""}
                  textStyle={{ marginLeft: 10 }}
                />

                {showDescription && (
                  <BodyText
                    text={data?.description || ""}
                    textStyle={{ marginLeft: 10 }}
                  />
                )}
              </View>
            </View>

            {showValue && (
              <View style={styles.counterStyle}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setCanFave(!canFave);
                  }}
                >
                  <MaterialCommunityIcons
                    name={canFave ? "heart" : "heart-outline"}
                    size={24}
                    color="#FA0707"
                  />
                </Pressable>
              </View>
            )}
          </View>

          {showToggle && (
            <>
              <View style={styles.signatureMenuButtonContainer}>

                <PrimaryActionButton
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleSignatureMenu?.();
                  }}
                  title={
                    isSignatureMenuOpen
                      ? "Hide Signature Menu"
                      : "Show Signature Menu"
                  }
                  style={{ minWidth: "100%" }}
                />
              </View>

              {isSignatureMenuOpen && (
                <View style={styles.signatureMenuContainer}>
                  {loadingSignatureMenu ? (
                    <BodyText text="Loading signature menu..." />
                  ) : signatureMenu.length === 0 ? (
                    <BodyText text="No signature menu available." />
                  ) : (
                    signatureMenu.map((item, index) => (
                      <View
                        key={index}
                        style={styles.menuItem}
                      >
                        <SectionText text={item?.name || ""} />

                        {!!item?.description && (
                          <BodyText text={item.description} />
                        )}
                      </View>
                    ))
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
    );
  };

const styles = ScaledSheet.create({
  card: {
    width: "100%",
    borderRadius: "10@ms",
    backgroundColor: "#F5F5F5",
    padding: "10@ms",
    marginBottom: "10@ms",
  },

  selectedCard: {
    borderWidth: 1,
    borderColor: "#12B76A",
    backgroundColor: "#ECFDF3",
  },

  detailRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    flex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  textContainer: {
    marginLeft: 8,
    backgroundColor: "transparent",
    flex: 1,
  },

  counterStyle: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  signatureMenuButtonContainer: {
    width: "100%",
    marginTop: "10@ms",
    backgroundColor: "transparent",
  },

  signatureMenuContainer: {
    width: "100%",
    marginTop: "10@ms",
    backgroundColor: "transparent",
  },

  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8@ms",
    padding: "10@ms",
    marginBottom: "8@ms",
  },
});

export default ChefCardWithBioPicAndToggle;
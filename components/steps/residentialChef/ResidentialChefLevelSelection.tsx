import React, { useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable, StyleProp, View, ViewStyle } from "react-native";
import ChefLevelCard from "@/components/cards/ChefLevelCard";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefHat.png";
import BodyText from "../../typography/BodyText";
import { getResidentialServicePricing, getServiceCategoryPricing, getServicePricing } from "@/services/servicePricing";
import ListCardWithIconAndValueAtEnd from "@/components/cards/ListCardWithIconAndValueAtEnd";
import { chefCategoryIcons } from "@/constants/Typography";
import PrimaryLoader from "@/components/Loader";
import Ionicons from "@expo/vector-icons/build/Ionicons";

interface ResidentialChefLevelSelectionProps {
  title: string;
  description: string;
  serviceId: string;
  serviceCatId?: string;
  selectedChefLevel?: {
    id: string;
    chefCatId: string;
    chefCatName: string;
    basePriceMinor: number;
    monthlySubFee: number;
    numberOfDays: number;

  };
  onChange?: (nextValue: { id: string; chefCatName: string; chefCatId: string; monthlySubFee: number; numberOfDays: number; basePriceMinor: number }) => void;
  error?: string;
  touched?: boolean;
}

const ResidentialChefLevelSelection: React.FC<ResidentialChefLevelSelectionProps> = ({ serviceId, title, description, selectedChefLevel, onChange, error, touched }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [chefCategoryServicePricing, setChefCategoryServicePricing] = useState<any[]>([]);

  const handleSelectionChange = (category: { id: string; chefCatName: string; chefCatId: string; monthlySubFee: number; numberOfDays: number; basePriceMinor: number }) => {
    if (onChange) {
      onChange(category);
    }
  };

  useEffect(() => {
    const fetchServicePricing = async () => {
      try {
        setLoading(true);
        const response = await getResidentialServicePricing(serviceId);
        const formatted = response.map((item: any) => ({
          ...item,
          icon: chefCategoryIcons[item.chefCatName] ?? require("../../../assets/icons/chefCategoryIcons/proChef.png"),
        }));
        setChefCategoryServicePricing(formatted);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchServicePricing();
  }, [serviceId]);

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
          <Image source={chefIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </IconWrapper>
        <SectionText text={title} />
        <BodyText text={description} textStyle={{ textAlign: "center" }} />
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#FFFBED",
            width: "100%",
            padding: 10,
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 5,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#F59E0B" />
          <View style={{ flex: 1, backgroundColor: "transparent", maxWidth: "90%" }}>
            <BodyText
              text="All testing and monthly service prices exclude groceries and ingredients."
            />
          </View>
        </View>
        {!!(touched && error) && <BodyText text={error} textStyle={{ color: "#B42318" }} />}
      </FrameCard>

      <FrameCard style={{ alignItems: "center" }}>
        {loading ? (
          <PrimaryLoader />
        ) : (
          <>
            {chefCategoryServicePricing.length === 0 && <BodyText text="No chefs available for this category." />}
            {chefCategoryServicePricing.map((option) => (
              
                <ChefLevelCard
                key={option.id}
                onPress={() => handleSelectionChange(option)}
                  data={option}
                  showDescription
                  showValue
                  style={{ borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: selectedChefLevel?.chefCatId === option.chefCatId ? "#ECFDF3" : "#F5F5F5" }}
                />
            ))}
          </>
        )}
      </FrameCard>
    </>
  );
};

const styles = ScaledSheet.create({
  titleCard: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ResidentialChefLevelSelection;

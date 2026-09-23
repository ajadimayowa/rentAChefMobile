import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefHat.png";
import BodyText from "../../typography/BodyText";
import { getServiceCategoryPricing, getServicePricing, getSpecialServicePricing } from "@/services/servicePricing";
import ListCardWithIconAndValueAtEnd from "@/components/cards/ListCardWithIconAndValueAtEnd";
import { chefCategoryIcons } from "@/constants/Typography";
import PrimaryLoader from "@/components/Loader";

interface SpecialServiceChefLevelProps {
  title: string;
  description: string;
  specialServiceId: string;
  serviceCatId?: string;
  chefExpertLevel?: {
    id: string;
    chefCatId: string;
    name: string;
    basePriceMinor: number;
  };
  onChange?: (nextValue: { id: string; name: string; basePriceMinor: number }) => void;
  error?: string;
  touched?: boolean;
}

const SpecialServiceChefLevel: React.FC<SpecialServiceChefLevelProps> = ({ specialServiceId, description,chefExpertLevel, onChange, error, touched }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [chefCategoryServicePricing, setChefCategoryServicePricing] = useState<any[]>([]);

  const handleSelectionChange = (category: { id: string; name: string; basePriceMinor: number }) => {
    if (onChange) {
      onChange(category);
    }
  };

  useEffect(() => {
    const fetchServicePricing = async () => {
      try {
        setLoading(true);
        const response = await  getSpecialServicePricing(specialServiceId);
        console.log("Fetched special service pricing:", response);
        const formatted = response.map((item: any) => ({
          ...item,
          basePriceMinor: item.value,
          icon: chefCategoryIcons[item.name] ?? require("../../../assets/icons/chefCategoryIcons/proChef.png"),
        }));
        setChefCategoryServicePricing(formatted);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchServicePricing();
  }, [specialServiceId]);

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
          <Image source={chefIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </IconWrapper>
        <SectionText text="Select Chef Level" />
        <BodyText text={description} />
        {!!(touched && error) && <BodyText text={error} textStyle={{ color: "#B42318" }} />}
      </FrameCard>

      <FrameCard style={{ alignItems: "center" }}>
        {loading ? (
          <PrimaryLoader />
        ) : (
          <>
            {chefCategoryServicePricing.length === 0 && <BodyText text="No expert level set yet" />}
            {chefCategoryServicePricing.map((option) => (
              <Pressable onPress={() => handleSelectionChange(option)} key={option.id} style={{ marginBottom: 10 }}>
                <ListCardWithIconAndValueAtEnd
                  data={option}
                  showDescription
                  showValue
                  style={{ backgroundColor: chefExpertLevel?.chefCatId === option.chefCatId ? "#ECFDF3" : "#F5F5F5" }}
                />
              </Pressable>
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

export default SpecialServiceChefLevel;

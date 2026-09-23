import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import chefIcon from "../../../assets/icons/chefIcon.png";
import BodyText from "../../typography/BodyText";
import { getChefsWithChefCategory } from "@/services/chefService";
import PrimaryLoader from "@/components/Loader";
import ChefCardWithPicAndToggle from "@/components/cards/ChefCardWithPicAndToggle";

interface ChooseChefProps {
    title:string
  description: string;
  serviceId: string;
  chefCategory: {
    id: string;
    chefCatId: string;
    name: string;
    basePriceMinor: number;
  };
  chef: {
    id: string;
    chefCatId: string;
    name: string;
  };
  onChange?: (nextValue: { id: string; name: string; basePriceMinor: number }) => void;
  error?: string;
  touched?: boolean;
}

const ChooseChef: React.FC<ChooseChefProps> = ({title, description, chef, chefCategory, onChange, error, touched }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [chefs, setChefs] = useState<any[]>([]);
  const [openSignatureMenuChefId, setOpenSignatureMenuChefId] = useState<string | null>(null);

  const handleSelectionChange = (selectedChef: { id: string; name: string; basePriceMinor: number }) => {
    if (onChange) {
      onChange(selectedChef);
    }

    setOpenSignatureMenuChefId((previousChefId) =>
      previousChefId && previousChefId !== selectedChef.id ? null : previousChefId
    );
  };

  useEffect(() => {
    const fetchChefsFromCategory = async () => {
      try {
        setLoading(true);
        const response = await getChefsWithChefCategory(chefCategory?.chefCatId || "", 20, 1);
        const formatted = response.map((item: any) => ({
          ...item,
          id: String(item?.id || item?._id || item?.chefId || ""),
          chefId: String(item?.chefId || item?.id || item?._id || ""),
          icon: item.profilePic,
        }));

        setChefs(formatted);
        setOpenSignatureMenuChefId(null);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchChefsFromCategory();
  }, [chefCategory?.chefCatId]);

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
          <Image source={chefIcon} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </IconWrapper>
        <SectionText text={title} />
        <BodyText text={description} />
        {!!(touched && error) && <BodyText text={error} textStyle={{ color: "#B42318" }} />}
      </FrameCard>

      <FrameCard style={{ alignItems: "center", width: "100%" }}>
        {loading ? (
          <PrimaryLoader />
        ) : (
          <>
            {chefs.length === 0 && <BodyText text="No chefs available for this category." />}
            {chefs.map((option) => (
              <ChefCardWithPicAndToggle
                key={option.id}
                data={option}
                showDescription
                showValue
                showToggle
                selected={chef?.id === option.id}
                isSignatureMenuOpen={openSignatureMenuChefId === option.id}
                onToggleSignatureMenu={() =>
                  setOpenSignatureMenuChefId((previousChefId) => (previousChefId === option.id ? null : option.id))
                }
                onPress={() => handleSelectionChange(option)}
                style={{ width: "100%" }}
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

export default ChooseChef;

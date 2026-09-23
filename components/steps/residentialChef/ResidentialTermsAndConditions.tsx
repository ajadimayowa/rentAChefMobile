import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import { Ionicons } from "@expo/vector-icons";
import SectionText from "../../typography/SectionText";
import iconShield from "../../../assets/icons/shield-icon.png";
import BodyText from "../../typography/BodyText";
import { getServiceCatTermsAndCons } from "@/services/termsAndConService";
import PrimaryLoader from "../../Loader";

interface ResidentialTermsAndConditionsProps {
  serviceCategoryId: string;
  categoryName: string;
  slug: string;
  value?: boolean;
  onChange?: (nextValue: boolean) => void;
  error?: string;
  touched?: boolean;
}

interface TermsAndConItem {
  description: string;
}

const ResidentialTermsAndConditions: React.FC<ResidentialTermsAndConditionsProps> = ({
  serviceCategoryId,
  categoryName,
  value,
  onChange,
  error,
  touched,
}) => {
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [localChecked, setLocalChecked] = useState<boolean>(false);

  const checked = typeof value === "boolean" ? value : localChecked;

  const handleCheckChange = (nextValue: boolean) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }

    setLocalChecked(nextValue);
  };

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        setLoading(true);
        const response = await getServiceCatTermsAndCons(serviceCategoryId);
        setTermsAndConditions(response);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchTermsAndConditions();
  }, [serviceCategoryId]);

  return (
    <>
      <FrameCard style={styles.titleCard}>
        <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
          <Image source={iconShield} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </IconWrapper>
        <SectionText text="Terms & Conditions" />
        <BodyText text={`${categoryName} Terms and Conditions`} />
        {!!(touched && error) && <BodyText text={error} textStyle={{ color: "#B42318" }} />}
      </FrameCard>

      <FrameCard>
        {loading ? (
          <PrimaryLoader />
        ) : (
          termsAndConditions.map((term: TermsAndConItem, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                margin: 10,
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <Ionicons name="checkmark-circle" size={14} color="#090909ff" style={{ marginRight: 10 }} />
              <BodyText text={term?.description} />
            </View>
          ))
        )}
      </FrameCard>

      <FrameCard
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffffff",
        }}
      >
        {!loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              gap: 10,
              backgroundColor: "transparent",
            }}
          >
            <Pressable
              onPress={() => handleCheckChange(!checked)}
              style={{
                width: 24,
                height: 24,
                borderWidth: 1,
                borderColor: touched && error ? "#B42318" : "#545454ff",
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: checked ? "#12B76A" : "#fff",
              }}
            >
              {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </Pressable>

            <Pressable onPress={() => handleCheckChange(!checked)}>
              <View style={{ maxWidth: "90%", backgroundColor: "transparent" }}>
                <SectionText text="I accept the Terms & Conditions" textStyle={{ color: touched && error ? "#B42318" : "#000" }} />
                <BodyText
                  text="By proceeding, you agree to the service policies above."
                  textStyle={{ color: touched && error ? "#B42318" : "#000" }}
                />
              </View>
            </Pressable>
          </View>
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

export default ResidentialTermsAndConditions;

import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "@/components/cards/FrameCard";
import SectionText from "@/components/typography/SectionText";
import BodyText from "@/components/typography/BodyText";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import ListPickerModal from "@/components/modals/calendar/ListPickerModal";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import MultiStepInput from "@/components/inputs/MultiStepInputType";

interface ResidentialLocationDetailsProps {
  isFarArea: string;
  isGatedCommunity: string;
  gateAccessCode: string;
  isCodeSent: string;

  onIsFarAreaChange: (nextValue: string) => void;
  onIsGatedCommunityChange: (nextValue: string) => void;
  onGateAccessCodeChange: (nextValue: string) => void;
  onIsCodeSentChange: (nextValue: string) => void;
  onFieldTouched?: (fieldName: "isFarArea" | "isGatedCommunity" | "gateAccessCode" | "isCodeSent" ) => void;
  errors?: {
    isFarArea?: string;
    isGatedCommunity?: string;
    gateAccessCode?: string;
    isCodeSent?: string;
  };
  touched?: {
    isFarArea?: boolean;
    isGatedCommunity?: boolean;
    gateAccessCode?: boolean;
    isCodeSent?: boolean;
  };
}

const ResidentialLocationDetails: React.FC<ResidentialLocationDetailsProps> = ({
  isFarArea,
  isGatedCommunity,
  gateAccessCode,
  isCodeSent,
  onIsFarAreaChange,
  onIsGatedCommunityChange,
  onGateAccessCodeChange,
  onIsCodeSentChange,
  onFieldTouched,
  errors,
  touched,
}) => {
  const [showIsFarArea, setShowIsFarArea] = useState(false);
  const [showIsGatedCommunity, setShowIsGatedCommunity] = useState(false);
  const [showIsCodeSent, setShowIsCodeSent] = useState(false);
  

  return (
    <>
      <FrameCard style={{ alignItems: "center" }}>
        <SectionText text="Location Details" />
        <BodyText text="Access and environment information" textStyle={{ textAlign: "center" }} />

        <View
          style={{
            marginTop: 10,
            backgroundColor: "#f8f8ff",
            width: "100%",
            padding: 10,
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 5,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#6770f6" />
          <View style={{ flex: 1, backgroundColor: "transparent", maxWidth: "90%" }}>
            <BodyText
            textStyle={{ color: "#6770f6" }}
              text="Customers residing in far locations (After Jakande, Ikoyi, Banana Island, Victoria Island) will be charged an extra transportation fee of ₦40,000/month after the testing phase when the chef resumes fully."
            />
          </View>
        </View>
      </FrameCard>

      <FrameCard>
        <SelectActionButton
          value={isFarArea || ""}
          onPress={() => setShowIsFarArea(true)}
          label="Is your location in a far area?"
        />

        <SelectActionButton
          value={isGatedCommunity || ""}
          onPress={() => setShowIsGatedCommunity(true)}
          label="Gated Estate?"
        />
        <MultiStepInput
          value={gateAccessCode}
          onChangeText={(nextValue) => {
            onFieldTouched?.("gateAccessCode");
            // Handle gate access code change here
            onGateAccessCodeChange?.(nextValue);
          }}
          placeholder="Enter gate access code"
          label="Gate Access Code"
        />
        

        <SelectActionButton
          value={isCodeSent || ""}
          onPress={() => setShowIsCodeSent(true)}
          label="Code Sent?"
        />
        {!!touched?.isCodeSent && !!errors?.isCodeSent && (
          <BodyText text={String(errors.isCodeSent)} textStyle={{ color: "#B42318", marginTop: 8 }} />
        )}
      </FrameCard>

      <FrameCard>
         <View
          style={{
            marginTop: 10,
            backgroundColor: "#fffdf8",
            width: "100%",
            padding: 10,
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 5,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#2a1a04" />
          <View style={{ flex: 1, backgroundColor: "transparent", maxWidth: "90%" }}>
            <BodyText
            textStyle={{ color: "#2a1a04", }}
              text="- Please keep pets (especially guard dogs) away from chefs and workers."
            />

            <BodyText
            textStyle={{ color: "#2a1a04", }}
              text="- Consider walk time from estate gate to residence if location is far."
            />

            <BodyText
            textStyle={{ color: "#2a1a04", }}
              text="- Kitchen must have basic appliances and equipment"
            />

            <BodyText
            textStyle={{ color: "#2a1a04", }}
              text="- Gas cylinder must be checked, filled, and burner working perfectly"
            />

            <BodyText
            textStyle={{ color: "#2a1a04", }}
              text="- All ingredients must be available before chefs' arrival"
            />
          </View>
        </View>
      </FrameCard>

      <ListPickerModal
        visible={showIsFarArea}
        onClose={() => setShowIsFarArea(false)}
        title="Is your location in a far area?"
        options={["Yes", "No"]}
        onSelect={(selectedOption) => {
          onIsFarAreaChange(selectedOption);
          onFieldTouched?.("isFarArea");
          setShowIsFarArea(false);
        }}
      />

      <ListPickerModal
        visible={showIsGatedCommunity}
        onClose={() => setShowIsGatedCommunity(false)}
        title="Is your location in a gated community?"
        options={["Yes", "No"]}
        onSelect={(selectedOption) => {
          onIsGatedCommunityChange(selectedOption);
          onFieldTouched?.("isGatedCommunity");
          setShowIsGatedCommunity(false);
        }}
      />

      <ListPickerModal
        visible={showIsCodeSent}
        onClose={() => setShowIsCodeSent(false)}
        title="Code Sent?"
        options={["Yes", "No"]}
        onSelect={(selectedOption) => {
          onIsCodeSentChange(selectedOption);
          onFieldTouched?.("isCodeSent");
          setShowIsCodeSent(false);
        }}
      />
    </>
  );
};

const styles = ScaledSheet.create({
  checkboxRowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: "10@vs",
    backgroundColor: "transparent",
  },
  checkableInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  checkboxBase: {
    width: "20@ms",
    height: "20@ms",
    borderRadius: "4@ms",
    borderWidth: 1,
    borderColor: "#98A2B3",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  daysWrap: {
    marginTop: "10@vs",
    width: "100%",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: "10@ms",
    padding: "10@ms",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    backgroundColor: "#fff",
  },
  dayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "22%",
    backgroundColor: "transparent",
  },
});

export default ResidentialLocationDetails;

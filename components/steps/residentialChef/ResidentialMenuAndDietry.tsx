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

interface ResidentialMenuAndDietryProps {
  menuPreferences: string;
  spicyLevel: string;
  allergies: string;
  leftOverHandling: string;
  dietaryPreferences: string;
  chefNotes: string;

  onMenuPreferencesChange: (nextValue: string) => void;
  onSpicyLevelChange: (nextValue: string) => void;
  onAllergiesChange: (nextValue: string) => void;
  onLeftOverHandlingChange: (nextValue: string) => void;
  onDietaryPreferencesChange: (nextValue: string) => void;
  onChefNotesChange: (nextValue: string) => void;
  onFieldTouched?: (fieldName: "menuPreferences" | "spicyLevel" | "allergies" | "leftOverHandling" | "dietaryPreferences" | "chefNotes") => void;
  errors?: {
    menuPreferences?: string;
    spicyLevel?: string;
    allergies?: string;
    leftOverHandling: string;
    dietaryPreferences?: string;
    chefNotes?: string;
  };
  touched?: {
    menuPreferences?: boolean;
    spicyLevel?: boolean;
    allergies?: boolean;
    leftOverHandling?: boolean;
    dietaryPreferences?: boolean;
    chefNotes?: boolean;
  };
}

const ResidentialMenuAndDietry: React.FC<ResidentialMenuAndDietryProps> = ({
  menuPreferences,
  spicyLevel,
  allergies,
  leftOverHandling,
  dietaryPreferences,
  chefNotes,
  onMenuPreferencesChange,
  onSpicyLevelChange,
  onAllergiesChange,
  onLeftOverHandlingChange,
  onDietaryPreferencesChange,
  onChefNotesChange,
  onFieldTouched,
  errors,
  touched,
}) => {
  const [showSpicyLevelModal, setShowSpicyLevelModal] = useState(false);
  const [showLeftOverHandlingModal, setShowLeftOverHandlingModal] = useState(false);
  

  return (
    <>
      <FrameCard style={{ alignItems: "center" }}>
        <SectionText text="Menu & Dietary" />
        <BodyText text="Specific food preferences and requirements" textStyle={{ textAlign: "center" }} />

       
      </FrameCard>

      <FrameCard>
        <MultiStepInput
          value={menuPreferences}
          inputType="multiline"
          touched={touched?.menuPreferences}
          error={errors?.menuPreferences}
          onBlur={() => onFieldTouched?.("menuPreferences")}
          onChangeText={(nextValue) => {
            onMenuPreferencesChange?.(nextValue);
          }}
          placeholder="Specific dish you want on a regular"
          label="Menu Preferences"
        />

        <SelectActionButton
          value={spicyLevel || ""}
          onPress={() => setShowSpicyLevelModal(true)}
          label="Spicy Level"
        />
        {!!touched?.spicyLevel && !!errors?.spicyLevel && (
          <BodyText text={String(errors.spicyLevel)} textStyle={{ color: "#B42318", marginTop: 8 }} />
        )}

        <MultiStepInput
          value={allergies}
          inputType="multiline"
          touched={touched?.allergies}
          error={errors?.allergies}
          onBlur={() => onFieldTouched?.("allergies")}
          onChangeText={(nextValue) => {
            onAllergiesChange?.(nextValue);
          }}
          placeholder="List any allergies"
          label="Allergies"
        />

        <SelectActionButton
          value={leftOverHandling || ""}
          onPress={() => setShowLeftOverHandlingModal(true)}
          label="Leftover Storage Handling"
        />
        {!!touched?.leftOverHandling && !!errors?.leftOverHandling && (
          <BodyText text={String(errors.leftOverHandling)} textStyle={{ color: "#B42318", marginTop: 8 }} />
        )}

        <MultiStepInput
          value={dietaryPreferences}
          inputType="multiline"
          touched={touched?.dietaryPreferences}
          error={errors?.dietaryPreferences}
          onBlur={() => onFieldTouched?.("dietaryPreferences")}
          onChangeText={(nextValue) => {
            onDietaryPreferencesChange?.(nextValue);
          }}
          placeholder="e.g Vegetarian, Vegan, Gluten-Free, etc."
          label="Dietary Preferences"
        />

        <MultiStepInput
          value={chefNotes}
          inputType="multiline"
          touched={touched?.chefNotes}
          error={errors?.chefNotes}
          onBlur={() => onFieldTouched?.("chefNotes")}
          onChangeText={(nextValue) => {
            onChefNotesChange?.(nextValue);
          }}
          placeholder="Any additional notes for your matched chef"
          label="Note for Your Matched Chef"
        />

      </FrameCard>

      <ListPickerModal
        visible={showSpicyLevelModal}
        onClose={() => setShowSpicyLevelModal(false)}
        title="Spicy Level"
        options={["Mild", "Medium", "Hot"]}
        onSelect={(selectedOption) => {
          onSpicyLevelChange(selectedOption);
          onFieldTouched?.("spicyLevel");
          setShowSpicyLevelModal(false);
        }}
      />

      <ListPickerModal
        visible={showLeftOverHandlingModal}
        onClose={() => setShowLeftOverHandlingModal(false)}
        title="Leftover Storage Handling"
        options={["Refrigerate in containers", "Pack for later/freezer","Dispose of leftovers"]}
        onSelect={(selectedOption) => {
          onLeftOverHandlingChange(selectedOption);
          onFieldTouched?.("leftOverHandling");
          setShowLeftOverHandlingModal(false);
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

export default ResidentialMenuAndDietry;

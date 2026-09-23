import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import cookingPot from "../../../assets/icons/proteinoptions/cookingPot.png";
import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";
import ReusableInput from "@/components/ReusableInput";
import MultiStepInput from "@/components/inputs/MultiStepInputType";

interface CookingInstructionsProps {
    value?: string;
    onChange?: (nextValue: string) => void;
    error?: string;
    touched?: boolean;
}


const CookingInstructions: React.FC<CookingInstructionsProps> = ({ value, onChange, error, touched }) => {
    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cookingPot} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Cooking Instructions" />
                <BodyText textStyle={{textAlign:'center'}} text={'Kindly provide details on how you want the selected meat to be cooked.'} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard>
                <MultiStepInput
                label="Cooking Preferences"
                placeholder="Describe your cooking preferences."
                    inputType="multiline"
                    value={value || ""}
                    onChangeText={(nextValue) => onChange?.(nextValue)}
                    onBlur={() => { }}
                    touched={touched}
                    error={error}
                />
            </FrameCard>
        </>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        padding: "20@ms",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: "24@ms",
        fontWeight: "bold",
        marginBottom: "20@ms",
    },
    scrollContainer: {
        flex: 1,
    },
    text: {
        fontSize: "16@ms",
        marginBottom: "10@ms",
    },
    titleCard: {
        alignItems: "center",
        justifyContent: "center",
    },
});

export default CookingInstructions;
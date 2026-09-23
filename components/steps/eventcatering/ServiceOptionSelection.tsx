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
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";

interface ServiceOptionSelectionProps {
    serviceOption?: {
        id: string;
        name: string;
        description?: string;
        icon?: ImageSourcePropType;
    } | null;
    onServiceOptionChange?: (nextValue: {
        id: string;
        name: string;
        description?: string;
        icon?: ImageSourcePropType;
    }) => void;
    title: string;
    description: string;
    error?: string;
    touched?: boolean;
}


const ServiceOptionSelection: React.FC<ServiceOptionSelectionProps> = ({ serviceOption, title, description, onServiceOptionChange, error, touched }) => {

    console.log("serviceOption", serviceOption);
    const serviceOptions = [
        {
            id: "1",
            name: "Chef + Alase Only",
            description: "You provide the ingredients, we provide the cooking team."
        },
        {
            id: "2",
            name: "Servers Only",
            description: "Hire professional waiters and servers for your event."
        },
        {
            id: "3",
            name: "Pay Per Head Catering",
            description: "Full-service catering package including all ingredients and staff."
        },
    ];
    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cookingPot} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText textStyle={{textAlign:'center'}} text={description} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard>
                {
                    serviceOptions.map((option) => (
                        <ListCardWithTitleIconAndDescOnly
                        style={{ marginBottom: 10, borderWidth: option.id === serviceOption?.id ? 1 : 1, borderColor: option.id === serviceOption?.id ? "#12B76A" : "#f2f2f2ff" }}
                        data={option}
                        key={option.id}
                        showDescription={true}
                        onPress={() => onServiceOptionChange && onServiceOptionChange(option)}
                        />
                    ))
                }
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

export default ServiceOptionSelection;
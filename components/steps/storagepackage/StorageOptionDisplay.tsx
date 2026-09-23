import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import cookingPot from "../../../assets/icons/potOfSoupIcon.png";

import riceIcon from "../../../assets/icons/riceIcon.png";
import soupIcon from "../../../assets/icons/soupIcon.png";
import sideIcon from "../../../assets/icons/sideIcon.png";

import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";
import ReusableInput from "@/components/ReusableInput";
import MultiStepInput from "@/components/inputs/MultiStepInputType";
import ListCardWithTitleIconAndDescOnly from "@/components/cards/ListCardWithTitleIconAndDescOnly";
import { convertToThousand } from "@/helpers/utils";
import TitleText from "@/components/typography/TitleText";

interface StorageOptionDisplayProps {
    title: string;
    description: string;
    deliveryAddress: string;
    onDeliveryAddressChange: (nextValue: string) => void;
    touched: boolean;
    error: string | undefined;
}


const StorageOptionDisplay: React.FC<StorageOptionDisplayProps> = ({
    title, description, deliveryAddress, onDeliveryAddressChange, touched, error }) => {
    const serviceOptions = [
        {
            id: "1",
            name: "2 Rice",
            icon: riceIcon,
        },
        {
            id: "2",
            name: "2 Soup",
            icon: soupIcon,
        },
        {
            id: "3",
            name: "1 Side",
            icon: sideIcon,
        }
    ];
    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cookingPot} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText textStyle={{ textAlign: 'center' }} text={description} />

            </FrameCard>


            <FrameCard
                style={[
                    styles.menuRow
                ]}
            >
                <View style={{ flex: 1,backgroundColor:'#000000ff',borderRadius: 10, height: 150, width: '100%', flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <TitleText text={convertToThousand(80000)} textStyle={{color:'#fff', fontSize: 54}} />
                </View>
                <View style={{ flex: 1, flexDirection: 'row', gap: 20, justifyContent: 'space-between', alignItems: 'center',marginTop: 25}}>
                    {
                        serviceOptions.map((option, index) => (
                            <View key={index}>
                                <Image source={option.icon} resizeMode="contain" style={{ borderRadius: 10, maxWidth: "100%", maxHeight: "100%" }} />
                                <SectionText text={option.name} />
                            </View>
                        ))
                    }
                </View>
            </FrameCard>

            <FrameCard>
                <MultiStepInput
                    label="Delivery Address"
                    inputType="multiline"
                    value={deliveryAddress}
                    onChangeText={onDeliveryAddressChange}
                    placeholder="Enter your delivery address"
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
    menuRow: {
        width: "100%",
        padding:0,
        minHeight: "100@vs",
        borderWidth: 1,
        borderColor: "#EAECF0",
        borderTopLeftRadius: "10@ms",
        borderTopRightRadius: "10@ms",
        marginTop: "5@ms",
        backgroundColor: "#ffffffff",
        alignItems: "center",
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

export default StorageOptionDisplay;
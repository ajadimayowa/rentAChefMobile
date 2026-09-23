import React, { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType } from "react-native";
import { View } from "../../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import beefSlice from "../../../assets/icons/beef-slice.png";
import cowSlice from "../../../assets/icons/proteinoptions/streamline-emojis_cow.png";
import halfSlice from "../../../assets/icons/proteinoptions/noto_cut-of-meat.png";
import ramSlice from "../../../assets/icons/proteinoptions/openmoji_ram.png";
import chickenSlice from "../../../assets/icons/proteinoptions/noto_chicken.png";
import fishSlice from "../../../assets/icons/proteinoptions/noto_fish.png";
import BodyText from "../../typography/BodyText";
import ListCardWithIconAndCounter from "@/components/cards/ListCardWithIconAndCounter";

interface ProteinOptionsProps {
    description: string;
    serviceId: string;
    serviceCatId?: string;
    value?: ProteinOptionItem[];
    onChange?: (nextValue: ProteinOptionItem[]) => void;
    error?: string;
    touched?: boolean;
}

export interface ProteinOptionItem {
    label: string;
    value: string;
    count: number;
    icon: ImageSourcePropType;
}

export const DEFAULT_PROTEIN_OPTIONS: ProteinOptionItem[] = [
    { label: "Full Cow", value: "fullCow", count: 0, icon: cowSlice},
    { label: "Half Cow", value: "halfCow", count: 0, icon: halfSlice },
    { label: "Ram", value: "ram", count: 0, icon: ramSlice },
    { label: "Chicken Carton", value: "chickenCarton", count: 0, icon: chickenSlice },
    { label: "Fish Carton", value: "fishCarton", count: 0, icon: fishSlice },
];

const ProteinOptions: React.FC<ProteinOptionsProps> = ({ description, value, onChange, error, touched }) => {
    const [localSelection, setLocalSelection] = useState<ProteinOptionItem[]>(DEFAULT_PROTEIN_OPTIONS);

    const selectedValue = Array.isArray(value) && value.length > 0 ? value : localSelection;

    const syncSelection = useCallback((nextValue: ProteinOptionItem[]) => {
        if (onChange) {
            onChange(nextValue);
            return;
        }

        setLocalSelection(nextValue);
    }, [onChange]);

    useEffect(() => {
        if (!Array.isArray(value) || value.length === 0) return;

        const merged = DEFAULT_PROTEIN_OPTIONS.map((defaultOption) => {
            const matched = value.find((item) => item.value === defaultOption.value);
            if (!matched) return defaultOption;

            return {
                ...defaultOption,
                ...matched,
                count: Number.isFinite(matched.count) ? Math.max(0, matched.count) : 0,
            };
        });

        const isDifferent = JSON.stringify(merged) !== JSON.stringify(value);
        if (isDifferent) {
            syncSelection(merged);
        }
    }, [value, syncSelection]);

    const updateCount = (proteinValue: string, delta: number) => {
        const updated = selectedValue.map((option) => {
            if (option.value !== proteinValue) return option;

            return {
                ...option,
                count: Math.max(0, option.count + delta),
            };
        });

        syncSelection(updated);
    };

    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={beefSlice} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Protein Options" />
                <BodyText text={description} />
                {!!(touched && error) && (
                    <BodyText text={error} textStyle={{ color: "#B42318" }} />
                )}
            </FrameCard>

            <FrameCard>
                {selectedValue.map((option) => {
                    return (
                        <View key={option.value} style={{ marginBottom: 10 }}>
                            <ListCardWithIconAndCounter
                                data={option}
                                onIncrement={() => updateCount(option.value, 1)}
                                onDecrement={() => updateCount(option.value, -1)}
                            />
                        </View>

                    );
                })}
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

export default ProteinOptions;
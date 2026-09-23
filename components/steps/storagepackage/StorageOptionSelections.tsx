import React, { useState } from "react";
import { Image, Switch, TouchableOpacity, View } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Checkbox } from "react-native-paper";
import FrameCard from "../../cards/FrameCard";
import IconWrapper from "../../cards/IconWrapper";
import SectionText from "../../typography/SectionText";
import cookingPot from "../../../assets/icons/potOfSoupIcon.png";
import BodyText from "../../typography/BodyText";
import SelectActionButton from "@/components/buttons/SelectActionButton";
import ListPickerModal from "@/components/modals/calendar/ListPickerModal";

type StorageField = "riceOneDish" | "riceTwoDish" | "soupOneDish" | "soupTwoDish" | "sideDish" | "addProteinToRice" | "enabledVeganMode";

interface StorageOptionSelectionsProps {
    title: string;
    description: string;
    riceOneDish: string;
    riceTwoDish: string;
    soupOneDish: string;
    soupTwoDish: string;
    sideDish: string;
    addProteinToRice: boolean;
    enabledVeganMode: boolean;
    onRiceOneDishChange: (nextValue: string) => void;
    onRiceTwoDishChange: (nextValue: string) => void;
    onSoupOneDishChange: (nextValue: string) => void;
    onSoupTwoDishChange: (nextValue: string) => void;
    onSideDishChange: (nextValue: string) => void;
    onAddProteinToRiceChange: (nextValue: boolean) => void;
    onEnabledVeganModeChange: (nextValue: boolean) => void;
    onFieldTouch: (field: StorageField) => void;
    touched: Partial<Record<StorageField, boolean>>;
    errors: Partial<Record<StorageField, string | undefined>>;
}


const StorageOptionSelections: React.FC<StorageOptionSelectionsProps> = ({
    title,
    description,
    riceOneDish,
    riceTwoDish,
    soupOneDish,
    soupTwoDish,
    sideDish,
    addProteinToRice,
    enabledVeganMode,
    onRiceOneDishChange,
    onRiceTwoDishChange,
    onSoupOneDishChange,
    onSoupTwoDishChange,
    onSideDishChange,
    onAddProteinToRiceChange,
    onEnabledVeganModeChange,
    onFieldTouch,
    touched,
    errors,
}) => {
        const [activeModal, setActiveModal] = useState<StorageField | null>(null);

        const openModal = (field: StorageField) => {
            onFieldTouch(field);
            setActiveModal(field);
        };

        const closeModal = () => {
            if (activeModal) {
                onFieldTouch(activeModal);
            }
            setActiveModal(null);
        };

        const renderError = (field: StorageField) => {
            if (!(touched[field] && errors[field])) return null;

            return <BodyText text={String(errors[field])} textStyle={{ color: "#B42318", marginTop: 6, marginBottom: 8 }} />;
        };


    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={cookingPot} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text={title} />
                <BodyText textStyle={{ textAlign: 'center' }} text={description} />

            </FrameCard>

            <FrameCard style={styles.preferenceCard}>
                <View style={styles.preferenceRow}>
                    <View style={styles.preferenceTextWrap}>
                        <SectionText text="Enable Vegan Mode" textStyle={{ fontSize: 15, fontWeight: "600" }} />
                        <BodyText text="Filter meals to vegan-friendly options." textStyle={{ color: "#667085", marginTop: 2 }} />
                    </View>
                    <Switch
                        value={enabledVeganMode}
                        onValueChange={(nextValue) => {
                            onEnabledVeganModeChange(nextValue);
                            onFieldTouch("enabledVeganMode");
                        }}
                        thumbColor={enabledVeganMode ? "#ffffff" : "#f4f3f4"}
                        trackColor={{ false: "#D0D5DD", true: "#12B76A" }}
                    />
                </View>
                {renderError("enabledVeganMode")}
            </FrameCard>

            <FrameCard
            >
                <SelectActionButton
                    value={riceOneDish}
                    onPress={() => openModal("riceOneDish")}
                    label="Rice Dish 1"
                />
                {renderError("riceOneDish")}

                <SelectActionButton
                    value={riceTwoDish}
                    onPress={() => openModal("riceTwoDish")}
                    label="Rice Dish 2"
                />
                {renderError("riceTwoDish")}

                <SelectActionButton
                    value={soupOneDish}
                    onPress={() => openModal("soupOneDish")}
                    label="Soup Dish 1"
                />
                {renderError("soupOneDish")}

                <SelectActionButton
                    value={soupTwoDish}
                    onPress={() => openModal("soupTwoDish")}
                    label="Soup Dish 2"
                />
                {renderError("soupTwoDish")}

                <SelectActionButton
                disabled={addProteinToRice}
                    value={sideDish}
                    onPress={() => openModal("sideDish")}
                    label="Side Dish"
                />
                {renderError("sideDish")}

                {
                    !enabledVeganMode && <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.preferenceRow, { marginTop: 20 }]}
                    onPress={() => {
                        onAddProteinToRiceChange(!addProteinToRice);
                        onFieldTouch("addProteinToRice");
                    }}
                >
                    <View style={styles.preferenceTextWrap}>
                        <SectionText text="Add Protein To Rice" textStyle={{ fontSize: 15, fontWeight: "600" }} />
                        <BodyText text="Include proteins for selected rice dishes." textStyle={{ color: "#667085", marginTop: 2 }} />
                    </View>
                    <Checkbox
                        status={addProteinToRice ? "checked" : "unchecked"}
                        onPress={() => {
                            onAddProteinToRiceChange(!addProteinToRice);
                            onFieldTouch("addProteinToRice");
                        }}
                        color="#12B76A"
                    />
                </TouchableOpacity>}
                {renderError("addProteinToRice")}
            </FrameCard>
            {/* add protein to rice dish and soup dish options */}
            <ListPickerModal
                visible={activeModal === "riceOneDish"}
                onClose={closeModal}
                title="Rice Dish 1"
                options={["Jollof Rice", "Fried Rice","Coconut Rice", "White Rice"]}
                onSelect={(selectedOption) => {
                    onRiceOneDishChange(selectedOption);
                    onFieldTouch("riceOneDish");
                }}
            />

            <ListPickerModal
                visible={activeModal === "riceTwoDish"}
                onClose={closeModal}
                title="Rice Dish 2"
                options={["Jollof Rice", "Fried Rice", "Coconut Rice", "White Rice"]}
                onSelect={(selectedOption) => {
                    onRiceTwoDishChange(selectedOption);
                    onFieldTouch("riceTwoDish");
                }}
            />

            <ListPickerModal
                visible={activeModal === "soupOneDish"}
                onClose={closeModal}
                title="Soup Dish 1"
                options={["Egusi", "Efo Riro", "Afang", "Ogbono"]}
                onSelect={(selectedOption) => {
                    onSoupOneDishChange(selectedOption);
                    onFieldTouch("soupOneDish");
                }}
            />

            <ListPickerModal
                visible={activeModal === "soupTwoDish"}
                onClose={closeModal}
                title="Soup Dish 2"
                options={["Egusi", "Efo Riro", "Afang", "Ogbono"]}
                onSelect={(selectedOption) => {
                    onSoupTwoDishChange(selectedOption);
                    onFieldTouch("soupTwoDish");
                }}
            />

            <ListPickerModal
                visible={activeModal === "sideDish"}
                onClose={closeModal}
                title="Side Dish"
                options={["Plantain", "Moi Moi", "Coleslaw", "Salad"]}
                onSelect={(selectedOption) => {
                    onSideDishChange(selectedOption);
                    onFieldTouch("sideDish");
                }}
            />
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
    preferenceCard: {
        marginTop: "8@vs",
    },
    preferenceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8@vs",
    },
    preferenceTextWrap: {
        flex: 1,
        paddingRight: "10@ms",
    },
});

export default StorageOptionSelections;
import React, { useEffect, useState } from "react";
import { Image, Pressable } from "react-native";
import { View } from "../Themed";
import { ScaledSheet } from "react-native-size-matters";
import FrameCard from "../cards/FrameCard";
import IconWrapper from "../cards/IconWrapper";
import { Ionicons } from "@expo/vector-icons";
import SectionText from "../typography/SectionText";
import iconShield from "../../assets/icons/shield-icon.png";
import BodyText from "../typography/BodyText";
import { getTermsAndCons } from "@/services/termsAndConService";
import PrimaryLoader from "../Loader";

interface SpecialServiceTermsAndConditionsProps {
    specialMenuId: string;
    serviceName: string;
    serviceCatId?: string;
    value?: boolean;
    onChange?: (nextValue: boolean) => void;
    error?: string;
    touched?: boolean;
}

interface TermsAndConItem {
    description: string;
}
const SpecialServiceTermsAndConditions: React.FC<SpecialServiceTermsAndConditionsProps> = ({specialMenuId,serviceName, value, onChange, error, touched }) => {
    console.log("specialMenuId in SpecialServiceTermsAndConditions:", specialMenuId);
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
                // Replace with your API endpoint to fetch terms and conditions based on serviceId
                const response = await getTermsAndCons({specialMenuId:specialMenuId}); // Assuming the API returns an array of terms and conditions 
                // console.log("Fetched terms and conditions:", response);
                setTermsAndConditions(response); // Assuming the API returns an object with a 'terms' array
                setLoading(false);
            } catch (error) {
                console.error("Error fetching terms and conditions:", error);
                setTermsAndConditions([]);
                setLoading(false);

            }
        }
        fetchTermsAndConditions();
    }, [specialMenuId]);
    return (
        <>
            <FrameCard style={styles.titleCard}>
                <IconWrapper style={{ backgroundColor: "#F3F3F5" }}>
                    <Image source={iconShield} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </IconWrapper>
                <SectionText text="Terms & Conditions" />
                <BodyText text={`${serviceName} Terms and Conditions`} />
                 {!!(touched && error) && (
                <BodyText text={error} textStyle={{ color: "#B42318" }} />
            )}
            </FrameCard>

            <FrameCard>
                {loading ? <PrimaryLoader /> : termsAndConditions.map((term: TermsAndConItem, index) => (
                    <View key={index} style={{ flexDirection: "row", alignItems: "center", margin: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
                        <Ionicons name="checkmark-circle" size={14} color="#090909ff" style={{ marginRight: 10 }} />
                        <BodyText text={term?.description} />
                    </View>
                ))}
                {
                    !loading && termsAndConditions.length === 0 && (
                        <BodyText text="No terms and conditions set." textStyle={{textAlign:'center'}}/>
                    )
                }
            </FrameCard>

            {
                !loading && termsAndConditions.length>1 &&
                <FrameCard style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: '#ffffffff', }}>
                
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 10, gap: 10, backgroundColor: 'transparent', }}>
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
                        
                        <Pressable
                            onPress={() => handleCheckChange(!checked)}
                        >
                            <View style={{ maxWidth: "90%", backgroundColor: 'transparent', }}>
                                
                                <SectionText text="I accept the Terms & Conditions" textStyle={{color:touched && error?'#B42318':'#000'}} />
                                <BodyText text="By proceeding, you agree to the service policies above." textStyle={{color:touched && error?'#B42318':'#000'}} />
                            </View>
                        </Pressable>

                    </View>
            </FrameCard>}
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

export default SpecialServiceTermsAndConditions;
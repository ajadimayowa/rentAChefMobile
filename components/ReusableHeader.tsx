import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";

interface DashboardHeaderProps {
    name: string;
    location: string;
    avatar: string;
    placeholder?: string;
    onSearch?: (text: string) => void;
}

const ReusableHeader: React.FC<DashboardHeaderProps> = ({
    name,
    location,
    avatar,
    placeholder = "Search menu...",
    onSearch,
}) => {
    return (
        <>
        
        <View style={styles.wrapper}>
            <SafeAreaView style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}/>
            <View style={styles.headerCard}>
                {/* Profile row */}
                <View style={styles.profileRow}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />

                    <View>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.location}>{location}</Text>
                    </View>
                </View>

                {/* Headline */}
                <Text style={styles.headline}>
                    What delicacy{"\n"}are you craving for today?
                </Text>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                        onChangeText={onSearch}
                    />
                    <Feather name="search" size={20} color="#888" />
                </View>
            </View>
        </View>

        </>
    );
};

const styles = ScaledSheet.create({
    wrapper: {
        paddingHorizontal: '16@s',
        paddingTop: '20@vs',
    },

    headerCard: {
        backgroundColor: '#000',
        borderRadius: '28@s',
        padding: '20@s',
    },

    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '20@vs',
    },

    avatar: {
        width: '48@s',
        height: '48@s',
        borderRadius: '24@s',
        marginRight: '12@s',
    },

    name: {
        color: '#fff',
        fontSize: '16@s',
        fontWeight: '600',
    },

    location: {
        color: '#ccc',
        fontSize: '13@s',
        marginTop: '2@vs',
    },

    headline: {
        color: '#fff',
        fontSize: '22@s',
        fontWeight: '700',
        marginBottom: '20@vs',
        lineHeight: '30@vs',
    },

    searchContainer: {
        backgroundColor: '#fff',
        borderRadius: '30@s',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '16@s',
        height: '52@vs',
    },

    searchInput: {
        flex: 1,
        fontSize: '15@s',
        color: '#000',
        marginRight: '10@s',
    },
});

export default ReusableHeader;

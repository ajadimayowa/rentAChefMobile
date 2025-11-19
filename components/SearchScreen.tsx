// components/SearchScreen.tsx
import React from "react";
import { Modal, View, TextInput, Pressable, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";

interface SearchScreenProps {
  visible: boolean;
  onClose: () => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
          />
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <Text style={styles.infoText}>Search results will appear here</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "15@s",
    paddingVertical: "10@vs",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingHorizontal: "12@s",
    paddingVertical: "8@vs",
    borderRadius: "20@s",
    fontSize: "16@ms",
  },
  closeBtn: {
    marginLeft: "10@s",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: "14@ms",
    color: "#666",
  },
});

export default SearchScreen;

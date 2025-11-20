// app/(tabs)/guest-chefs.tsx
import React from "react";
import { View, ScrollView } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import SectionText from "@/components/typography/SectionText";

export default function GuestChefsScreen() {
  return (
    <View style={styles.container}>
      <HeaderBar
        title="Our Professional Chefs"
        subtitle="Find the right chef for your event"
        showSearch
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <SectionText text="Available chefs"/>
        <ChefCard
          image={require("../../assets/images/chefAvatar.jpg")}
          name="Chef James"
          location="Ikeja, Lagos"
          onPress={() => {}}
        />
        <ChefCard
          image={require("../../assets/images/chefAvatar.jpg")}
          name="Chef Mary"
          location="Yaba, Lagos"
          onPress={() => {}}
        />
        <ChefCard
          image={require("../../assets/images/chefAvatar.jpg")}
          name="Chef Ade"
          location="Lekki, Lagos"
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
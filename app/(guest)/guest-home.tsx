// app/(tabs)/guest-home.tsx
import React from "react";
import { View, ScrollView, Text } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import HeaderBar from "@/components/HeaderBar";
import ChefCard from "@/components/ChefCard";
import DishCard from "@/components/DishCard";
import SectionText from "@/components/typography/SectionText";

export default function GuestHomeScreen() {
  return (
    <View style={styles.container}>
      <HeaderBar title="Welcome to Rent A Cheff" showSearch />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <SectionText text="Made Near You!"/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <DishCard
            image={require("../../assets/images/chefAvatar.jpg")}
            title="Chicken Pie"
            price="₦2,500"
            onPress={() => {}}
          />
          <DishCard
            image={require("../../assets/images/chefAvatar.jpg")}
            title="Fruit Salad"
            price="₦1,200"
            onPress={() => {}}
          />
          <DishCard
            image={require("../../assets/images/chefAvatar.jpg")}
            title="Fruit Salad"
            price="₦1,200"
            onPress={() => {}}
          />
          <DishCard
            image={require("../../assets/images/chefAvatar.jpg")}
            title="Fruit Salad"
            price="₦1,200"
            onPress={() => {}}
          />
          <DishCard
            image={require("../../assets/images/chefAvatar.jpg")}
            title="Fruit Salad"
            price="₦1,200"
            onPress={() => {}}
          />
        </ScrollView>

        <Text style={styles.sectionTitle}>Chefs near you</Text>
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
          name="Chef Mary"
          location="Yaba, Lagos"
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
          name="Chef Mary"
          location="Yaba, Lagos"
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
          name="Chef Mary"
          location="Yaba, Lagos"
          onPress={() => {}}
        />
        <ChefCard
          image={require("../../assets/images/chefAvatar.jpg")}
          name="Chef Mary"
          location="Yaba, Lagos"
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  sectionTitle: { fontSize: "16@s", marginVertical: "10@vs", fontFamily:'titleFont'},
});
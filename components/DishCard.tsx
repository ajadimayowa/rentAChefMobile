import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BodyText from "./typography/BodyText";
import SectionText from "./typography/SectionText";
import { convertToThousand } from "@/helpers/utils";

interface DishCardProps {
  image: any;
  title: string;
  price: number;
  rating?: number;
  madeByChef:string;
  onPress: () => void;
  onLike?: () => void;
}

const DishCard: React.FC<DishCardProps> = ({
  image,
  title,
  price,
  madeByChef,
  rating = 4.5,
  onPress,
  onLike,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>

      <ImageBackground
        source={image}
        style={styles.image}
        imageStyle={styles.imageBorder}
      >

        {/* ✅ Gradient overlay */}
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        />

        {/* ✅ Favourite Icon */}
        <TouchableOpacity onPress={onLike} style={styles.heart}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </TouchableOpacity>

        {/* ✅ Rating Badge */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>

        {/* ✅ Content */}
        <View style={{width:'100%',display:'flex',  flexDirection:'row', justifyContent:'space-between'}}>
<View style={styles.content}>
  <SectionText textStyle={{color:'#fff'}} text={title}/>
  <BodyText textStyle={{color:'#fff'}} text={madeByChef}/>
          <Text style={styles.price}>{price?`From : ${convertToThousand(price)}`:'N0.00'}</Text>
        </View>

        <View style={{padding:10}}>
          <TouchableOpacity activeOpacity={0.9} style={{backgroundColor:'#fff',borderRadius:5,padding:10}}>
          <Text>Order</Text>
        </TouchableOpacity>
        </View>
        </View>

      </ImageBackground>

    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  card: {
    width: "250@s",
    height: "160@vs",
    marginRight: "12@s",
    borderRadius: "14@s",
    overflow: "hidden",
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageBorder: {
    borderRadius: "14@s",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  heart: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "6@s",
    borderRadius: "20@s",
    zIndex: 3,
  },

  ratingContainer: {
    position: "absolute",
    top: "10@vs",
    left: "10@s",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: "6@s",
    paddingVertical: "3@vs",
    borderRadius: "12@s",
    zIndex: 3,
  },

  ratingText: {
    color: "#fff",
    marginLeft: "4@s",
    fontSize: "11@s",
    fontWeight: "600",
  },

  content: {
    padding: "12@s",
    zIndex: 2,
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: "14@s",
  },

  price: {
    color: "#EA7052",
    fontWeight: "700",
    marginTop: "4@vs",
    fontSize: "13@s",
  },
});

export default DishCard;
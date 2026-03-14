import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BodyText from "./typography/BodyText";
import SectionText from "./typography/SectionText";
import { convertToThousand } from "@/helpers/utils";
import ReusableButton from "./buttons/ReusableButton";
import TitleText from "./typography/TitleText";

interface DishCardProps {
  image: any;
  title: string;
  onPress: () => void;
}

const BackgroundImageCard: React.FC<DishCardProps> = ({
  image,
  title,
  onPress
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

        <View style={{padding:15,alignItems:'center'}}>
          <SectionText textStyle={{color:'#fff',fontSize:28}} text={title}/>
          <BodyText textStyle={{color:'#fff',textAlign:'center'}} text="If you have a special request not listed here, reach out to us."/>
        <ReusableButton onPress={onPress} textStyle={{color:'#000'}} style={{backgroundColor:'#E39325',width:300,marginTop:20}} title="Send Request"/>
        </View>

      </ImageBackground>

    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  card: {
    width: "100%",
    marginTop: "22@s",
    borderRadius: "14@s",
    overflow: "hidden",
    alignItems:'center',
    justifyContent:'center',
  },

  image: {
    flex: 1,
    justifyContent: "center",
     width: "100%",
     alignItems:'center'
  },

  imageBorder: {
    borderRadius: "14@s"
    
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:'center',
    justifyContent:'center',
     padding:"10@ms"
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

  topText: {
    position: "absolute",
    top: "20@vs",
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
    maxWidth:'100%',
    overflow:'hidden',
    backgroundColor:'#000'
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

export default BackgroundImageCard;
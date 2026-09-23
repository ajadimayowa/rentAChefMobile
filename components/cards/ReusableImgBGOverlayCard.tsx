import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  ImageSourcePropType,
  Image,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface ReusableImgBGOverlayCardProps {
  image: ImageSourcePropType;
  normalText?: string;
  gradientText: string;
  description: string;
  height?: number;
  borderRadius?: number;
}

const ReusableImgBGOverlayCard: React.FC<ReusableImgBGOverlayCardProps> = ({
  image,
  normalText,
  gradientText,
  description,
  height = 160,
  borderRadius = 20,
}) => {
  return (
    <ImageBackground
      source={image}
      style={[styles.container, { height, borderRadius }]}
      imageStyle={{ borderRadius }}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={[styles.overlay, { borderRadius }]}>
            <View>
             <View style={styles.titleRow}>
          <Text style={styles.title}>{normalText} </Text>

          {/* Gradient Text */}
          <MaskedView
            maskElement={<Text style={[styles.title, styles.mask]}>{gradientText}</Text>}
          >
            <LinearGradient
              colors={["#FFAA00", "#2AB7C8", "#FFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {/* Dummy text to define size */}
              <Text style={[styles.title, styles.hidden]}>{gradientText}</Text>
            </LinearGradient>
          </MaskedView>
        </View>

        <Text style={styles.description}>{description}</Text>
            </View>

<Image source={require('../../assets/images/chefemoji.png')} style={{marginLeft:-50}}/>
       
      </View>
    </ImageBackground>
  );
};

export default ReusableImgBGOverlayCard;

const styles = ScaledSheet.create({
  container: {
    width: width - 40,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    flexDirection:'row',
    padding: "16@ms",
    width:'100%',
    justifyContent: "space-between",
    alignItems:'center',
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "6@ms",
  },
  title: {
    color: "#FFF",
    fontSize: "20@ms",
    fontWeight: "700",
  },
  mask: {
    backgroundColor: "transparent",
  },
  hidden: {
    opacity: 0, // hides duplicated text
  },
  description: {
    color: "#EAEAEA",
    fontSize: "14@ms",
    lineHeight: "20@ms",
    maxWidth: "85%",
  },
});
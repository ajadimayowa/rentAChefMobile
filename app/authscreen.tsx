import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScaledSheet } from "react-native-size-matters";
import Swiper from "react-native-swiper";
import Colors from "@/constants/Colors";
import ReusableButton from "@/components/buttons/ReusableButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const slides = [
    {
      id: 1,
      image: require("../assets/images/slides/homeSlides/slide1.png"),
      title: "Find Professional Chefs",
      description: "Connect with skilled chefs ready to create your dream meal.",
    },
    {
      id: 3,
      image: require("../assets/images/slides/homeSlides/slide2.png"),
      title: "Secure Payments",
      description: "Pay safely through our integrated payment system.",
    },
    {
      id: 2,
      image: require("../assets/images/slides/homeSlides/slide3.png"),
      title: "Book Instantly",
      description: "Choose your chef, set a time, and book in minutes.",
    },
    {
      id: 4,
      image: require("../assets/images/slides/homeSlides/slide4.png"),
      title: "Experience Great Taste",
      description: "Enjoy gourmet meals from the comfort of your home.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
    <StatusBar style="light"/>
    <View style={styles.screenContainer}>
      {/* 🔸 Top Swipeable Section */}
      <View style={styles.topFrame}>
        <Swiper
          autoplay
          autoplayTimeout={4}
          loop
          showsPagination={false} // we'll handle custom pagination
          onIndexChanged={(index) => setActiveIndex(index)}
        >
          {slides.map((slide, index) => (
            <ImageBackground
              key={slide.id}
              source={slide.image}
              style={styles.slideBackground}
            >
              <LinearGradient
                colors={[
                  "rgba(0, 0, 0, 0.1)",
                  "rgba(0, 0, 0, 0.1)",
                  "transparent",
                ]}
                style={styles.overlay}
              >
                <View style={styles.textContainer}>
                  <Image
                    source={require("../assets/images/chefLogoLight.png")}
                    style={{ height: 200, width: 210, resizeMode: "stretch" }}
                  />
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.description}>{slide.description}</Text>

                  {/* 🔸 Custom pagination dots under description */}
                  <View style={styles.paginationContainer}>
                    {slides.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          i === activeIndex && styles.activeDot,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          ))}
        </Swiper>
      </View>

      {/* 🔸 Bottom Section */}
      <View style={styles.bottomFrame}>
        <View style={{ width: '100%', padding: 20, gap: 10, flexDirection: 'row' }}>
          <View style={{ width: '50%' }}>
            <ReusableButton onPress={()=>router.navigate('/register')} title="Create Account" />
          </View>

          <View style={{ width: '50%' }}>
            <ReusableButton onPress={()=>router.navigate('/login')} type="outline" title="Login" />
          </View>
        </View>
        <View style={{ width: '100%', alignItems: 'center', display:'flex', justifyContent:'center'}}>
          <ReusableButton iconColor={'#E2725B'} onPress={()=>router.push("/(guest)/guest-home")} iconRight={"arrow-forward-outline"} extStyle={{width:'50%',padding:0}} textStyle={{color:'#000'}} type="pressableText" title="Continue as guest" />

        </View>

      </View>
    </View>
    </>
  );
}

const styles = ScaledSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topFrame: {
    flex: 3,
  },
  slideBackground: {
    width: "100%",
    height: "100%",
    position: 'absolute',
    top: 0, // Ensures it aligns to the top of the screen
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "20@ms",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: "28@ms",
    color: "#fff",
    textAlign: "center",
    marginBottom: "10@ms",
    fontFamily: "titleFont", // 👈 Your custom font
    textTransform: "uppercase", // 👈 Makes text ALL CAPS
  },
  description: {
    fontSize: "16@ms",
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    marginBottom: "15@ms",
  },

  // ✅ Custom pagination under description
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "30@ms",
  },
  dot: {
    width: "8@ms",
    height: "8@ms",
    borderRadius: "4@ms",
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: "4@ms",
  },
  activeDot: {
    backgroundColor: "orange",
    width: "10@ms",
    height: "10@ms",
  },

  // ✅ Curved bottom section
  bottomFrame: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: "35@ms",
    borderTopRightRadius: "35@ms",
    marginTop: "-30@ms",
    paddingTop: "20@ms",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
});
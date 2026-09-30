import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  Alert,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScaledSheet } from "react-native-size-matters";
import ReusableButton from "@/components/buttons/ReusableButton";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import useLocation from "@/hooks/useLocation";

type Slide = {
  id: number;
  image: number;
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image: require("../assets/images/onboarding/raconboard4.png"),
    title: "Find Professional Chefs",
    description: "Connect with skilled chefs ready to create your dream meal.",
  },
  {
    id: 3,
    image: require("../assets/images/onboarding/raconboard1.png"),
    title: "Secure Payments",
    description: "Pay safely through our integrated payment system.",
  },
  {
    id: 2,
    image: require("../assets/images/onboarding/raconboard2.png"),
    title: "Book Instantly",
    description: "Choose your chef, set a time, and book in minutes.",
  },
  {
    id: 4,
    image: require("../assets/images/onboarding/raconboard3.png"),
    title: "Experience Great Taste",
    description: "Enjoy gourmet meals from the comfort of your home.",
  },
];

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const sliderRef = useRef<FlatList<Slide>>(null);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { requestLocation, isBlocked, openLocationSettings } = useLocation();

  useEffect(() => {
    // ask for location access as soon as the user lands on the auth screen
    requestLocation().catch(() => {});
  }, [requestLocation]);

  useEffect(() => {
    // the OS only shows its permission dialog once per install — if the user
    // already denied it before, guide them to Settings instead of doing nothing
    if (!isBlocked) return;

    Alert.alert(
      "Location access disabled",
      "Enable location access in Settings so we can show chefs near you.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Open Settings", onPress: openLocationSettings },
      ]
    );
  }, [isBlocked, openLocationSettings]);

  const openTerms = () => Linking.openURL("https://www.rentachefapp.com/terms");
  const openPrivacyPolicy = () => Linking.openURL("https://www.rentachefapp.com/privacy-policy");

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % slides.length;
      sliderRef.current?.scrollToIndex({
        index: nextIndex,
        animated: nextIndex !== 0,
      });
      currentIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      currentIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [width]
  );

  const renderSlide = useCallback(
    ({ item }: { item: Slide }) => (
      <ImageBackground
        source={item.image}
        style={[styles.slideBackground, { width }]}
        imageStyle={styles.slideImage}
      >
        <LinearGradient
          colors={[
            "rgba(10, 14, 20, 0.2)",
            "rgba(10, 14, 20, 0.72)",
            "rgba(10, 14, 20, 0.96)",
          ]}
          style={styles.overlay}
        >
          <View style={styles.brandContainer}>
            <Image
              source={require("../assets/images/chefLogoLight.png")}
              style={styles.brandImage}
            />
          </View>

          <View style={styles.copyPanel}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    ),
    [width]
  );

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.screenContainer} edges={["top"]}>
        <View style={styles.topFrame}>
          <FlatList
            ref={sliderRef}
            data={slides}
            renderItem={renderSlide}
            keyExtractor={(item) => String(item.id)}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width}
            disableIntervalMomentum
            onMomentumScrollEnd={handleMomentumEnd}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews
          />

          <View style={styles.paginationContainer}>
            {slides.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.dot, index === activeIndex && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomFrame}>
          <Text style={styles.bottomLabel}>PRIVATE DINING, REIMAGINED</Text>
          <Text style={styles.bottomTitle}>Book a chef in minutes</Text>

          <View style={styles.buttonRow}>
            <View style={styles.halfButton}>
              <ReusableButton
                onPress={() => router.navigate("/register")}
                title="Create Account"
              />
            </View>

            <View style={styles.halfButton}>
              <ReusableButton
                onPress={() => router.navigate("/login")}
                type="outline"
                title="Login"
              />
            </View>
          </View>

          <Text style={styles.consentText}>
            By Continuing, You agree to our{" "}
            <Text style={styles.consentLink} onPress={openTerms}>
              Terms
            </Text>{" "}
            &{" "}
            <Text style={styles.consentLink} onPress={openPrivacyPolicy}>
              Policies
            </Text>
            .
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = ScaledSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#090D12",
  },
  topFrame: {
    flex: 1.35,
    backgroundColor: "#090D12",
  },
  slideBackground: {
    height: "100%",
    justifyContent: "flex-end",
  },
  slideImage: {
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: "22@ms",
    paddingTop: "8@ms",
    paddingBottom: "88@ms",
  },
  brandContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandImage: {
    height: "170@ms",
    width: "178@ms",
    resizeMode: "contain",
  },
  copyPanel: {
    backgroundColor: "rgba(7, 10, 14, 0.45)",
    borderRadius: "18@ms",
    paddingVertical: "16@ms",
    paddingHorizontal: "14@ms",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  title: {
    fontSize: "29@ms",
    color: "#F9FBFF",
    textAlign: "center",
    marginBottom: "8@ms",
    fontFamily: "titleFont",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  description: {
    fontSize: "15@ms",
    color: "rgba(241,245,251,0.88)",
    textAlign: "center",
    lineHeight: "22@ms",
  },
  paginationContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "58@ms",
    flexDirection: "row",
    justifyContent: "center",
    gap: "7@ms",
  },
  dot: {
    width: "8@ms",
    height: "8@ms",
    borderRadius: "10@ms",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  activeDot: {
    width: "26@ms",
    backgroundColor: "#E2725B",
  },
  bottomFrame: {
    minHeight: "250@ms",
    backgroundColor: "#F7F8FA",
    borderTopLeftRadius: "34@ms",
    borderTopRightRadius: "34@ms",
    marginTop: "-32@ms",
    paddingTop: "22@ms",
    paddingHorizontal: "18@ms",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 9,
    justifyContent: "center",
  },
  bottomLabel: {
    color: "#D17A67",
    fontSize: "11@ms",
    letterSpacing: 1.1,
    textAlign: "center",
    marginBottom: "8@ms",
    fontWeight: "700",
  },
  bottomTitle: {
    color: "#121722",
    textAlign: "center",
    fontSize: "23@ms",
    fontFamily: "titleFont",
    marginBottom: "18@ms",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: "10@ms",
    marginBottom: "8@ms",
  },
  halfButton: {
    width: "50%",
  },
  consentText: {
    textAlign: "center",
    fontSize: "12@s",
    marginTop: "14@vs",
    color: "#4B5563",
  },
  consentLink: {
    color: "#E2725B",
    fontWeight: "600",
  },
});
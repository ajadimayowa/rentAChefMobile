import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Same colours/image as the native splash screen configured in app.json —
// this screen takes over the instant that one hides, so the handoff reads
// as one continuous animation rather than two separate splash screens.
const BACKGROUND_COLOR = '#F3F3F1';
const LOGO = require('../assets/images/loadIcon.png');

const LOGO_IN_DURATION = 650;
const HOLD_DURATION = 700;
const FADE_OUT_DURATION = 350;
const DOT_COUNT = 3;

export default function LandingScreen() {
  const userProfile = useAppSelector((state) => state.auth.bioData);
  const router = useRouter();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.82);
  const dotsOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);
  const dotPulse = useSharedValue(0);

  const goToDestination = () => {
    if (userProfile?.id) {
      router.replace("/(dashboard)");
      return;
    }
    router.replace("/authscreen");
  };

  useEffect(() => {
    // Logo: gentle scale + fade in.
    logoOpacity.value = withTiming(1, {
      duration: LOGO_IN_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: LOGO_IN_DURATION,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Loading dots: fade in once the logo has settled, then pulse.
    dotsOpacity.value = withDelay(
      LOGO_IN_DURATION,
      withTiming(1, { duration: 250 })
    );
    dotPulse.value = withDelay(
      LOGO_IN_DURATION,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 420, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );

    // Hold, then fade the whole splash out and hand off to the real screen.
    const totalHold = LOGO_IN_DURATION + HOLD_DURATION;
    screenOpacity.value = withDelay(
      totalHold,
      withTiming(0, { duration: FADE_OUT_DURATION }, (finished) => {
        if (finished) runOnJS(goToDestination)();
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <Animated.Image source={LOGO} style={[styles.logo, logoStyle]} resizeMode="contain" />
      <Animated.View style={[styles.dotsRow, dotsStyle]}>
        {Array.from({ length: DOT_COUNT }).map((_, index) => (
          <Dot key={index} progress={dotPulse} index={index} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

function Dot({ progress, index }: { progress: SharedValue<number>; index: number }) {
  const dotStyle = useAnimatedStyle(() => {
    // Stagger each dot's phase so the pulse travels across the row.
    const phase = (progress.value + index / DOT_COUNT) % 1;
    const scale = interpolate(phase, [0, 0.5, 1], [0.6, 1, 0.6], Extrapolation.CLAMP);
    const opacity = interpolate(phase, [0, 0.5, 1], [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  logo: {
    width: 180,
    height: 180,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3F2E20',
  },
})

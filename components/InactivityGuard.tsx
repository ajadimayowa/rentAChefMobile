// components/InactivityGuard.tsx
import { INACTIVITY_TIMEOUT_MS } from "@/constants/session";
import { performLogout } from "@/services/auth/logout";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus, View } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Wraps the whole authenticated app tree and signs the user out after
 * INACTIVITY_TIMEOUT_MS of no interaction.
 *
 * "Inactivity" covers two things:
 *  1. No touches anywhere on screen while the app is in the foreground —
 *     detected via a responder-capture listener on the root View, which
 *     sees every touch as it starts, before any button/list/etc underneath
 *     gets a chance to claim it (so it never interferes with normal taps,
 *     scrolls or gestures).
 *  2. The app sitting backgrounded for the timeout — detected via AppState,
 *     so switching apps for a minute counts the same as leaving it idle.
 *
 * The timer only runs while someone is actually signed in, so it's a no-op
 * on the auth/onboarding screens.
 */
export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clientId = useAppSelector((state) => state.auth.bioData.id);
  const isAuthenticated = Boolean(clientId);

  // Mirrored in a ref so the timeout/AppState callbacks (set up once) always
  // see the latest auth state without needing to be re-subscribed.
  const isAuthenticatedRef = useRef(isAuthenticated);
  isAuthenticatedRef.current = isAuthenticated;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);
  const loggingOutRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const logoutForInactivity = useCallback(async () => {
    if (loggingOutRef.current || !isAuthenticatedRef.current) return;
    loggingOutRef.current = true;
    clearTimer();

    await performLogout();
    router.replace("/authscreen");
    Toast.show({
      type: "info",
      text1: "Signed out",
      text2: "You were logged out after a period of inactivity.",
    });

    loggingOutRef.current = false;
  }, [clearTimer, router]);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (!isAuthenticatedRef.current || loggingOutRef.current) return;
    timerRef.current = setTimeout(logoutForInactivity, INACTIVITY_TIMEOUT_MS);
  }, [clearTimer, logoutForInactivity]);

  // (Re)start the timer whenever auth state changes — starts it on login,
  // cancels it on logout.
  useEffect(() => {
    resetTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Count backgrounded time towards the inactivity window too.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") {
        backgroundedAtRef.current = Date.now();
        clearTimer();
        return;
      }

      if (next === "active") {
        const backgroundedAt = backgroundedAtRef.current;
        backgroundedAtRef.current = null;

        if (backgroundedAt && Date.now() - backgroundedAt >= INACTIVITY_TIMEOUT_MS) {
          logoutForInactivity();
        } else {
          resetTimer();
        }
      }
    });

    return () => subscription.remove();
  }, [clearTimer, logoutForInactivity, resetTimer]);

  return (
    <View
      style={{ flex: 1 }}
      // Fires for every touch as it starts, in the capture phase, before any
      // descendant (button, list, input…) decides to become the responder —
      // returning false means we're just observing, never claiming the
      // gesture, so nothing about normal touch handling changes.
      onStartShouldSetResponderCapture={() => {
        resetTimer();
        return false;
      }}
    >
      {children}
    </View>
  );
}

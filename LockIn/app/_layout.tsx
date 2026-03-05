import React, { useEffect, useRef, useCallback } from "react";
import { ActivityIndicator, View, AppState, AppStateStatus } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTaskStore } from "../store/taskStore";
import { useAppStore, checkDailyReset } from "../store/appStore";
import { Colors } from "../constants/theme";
import { reapplyShieldsIfNeeded } from "../modules/screen-time-module";

export default function RootLayout() {
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const clearAll = useTaskStore((s) => s.clearAll);
  const loadAppState = useAppStore((s) => s.loadAppState);
  const isOnboardingComplete = useAppStore((s) => s.isOnboardingComplete);
  const isAppReady = useAppStore((s) => s.isAppReady);
  const isLoaded = useTaskStore((s) => s.isLoaded);

  const router = useRouter();
  const segments = useSegments();
  const appStateRef = useRef(AppState.currentState);

  // Re-apply shields when the app comes to foreground
  // (in case user bypassed via "Continue Anyway")
  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
      reapplyShieldsIfNeeded().catch(() => {});
    }
    appStateRef.current = nextState;
  }, []);

  // Load app state + tasks on mount
  useEffect(() => {
    loadAppState();
    loadTasks().then(() => {
      checkDailyReset(clearAll);
    });

    // Re-apply shields on initial launch too
    reapplyShieldsIfNeeded().catch(() => {});

    // Listen for app foregrounding
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, []);

  // Redirect based on onboarding state
  useEffect(() => {
    if (!isAppReady || !isLoaded) return;

    const inOnboarding = segments[0] === "(onboarding)";

    if (!isOnboardingComplete && !inOnboarding) {
      router.replace("/(onboarding)/welcome");
    } else if (isOnboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isAppReady, isLoaded, isOnboardingComplete, segments]);

  // Show loading spinner while app state loads
  if (!isAppReady || !isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

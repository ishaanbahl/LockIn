import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "lockin_onboarding_complete";
const DAILY_RESET_KEY = "lockin_daily_reset";
const LAST_RESET_KEY = "lockin_last_reset_date";

interface AppState {
  isOnboardingComplete: boolean;
  isDailyResetEnabled: boolean;
  isAppReady: boolean;

  // Actions
  loadAppState: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setDailyReset: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingComplete: false,
  isDailyResetEnabled: false,
  isAppReady: false,

  loadAppState: async () => {
    try {
      const [onboarding, dailyReset] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(DAILY_RESET_KEY),
      ]);
      set({
        isOnboardingComplete: onboarding === "true",
        isDailyResetEnabled: dailyReset === "true",
        isAppReady: true,
      });
    } catch {
      set({ isAppReady: true });
    }
  },

  completeOnboarding: () => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true");
    set({ isOnboardingComplete: true });
  },

  resetOnboarding: () => {
    AsyncStorage.removeItem(ONBOARDING_KEY);
    set({ isOnboardingComplete: false });
  },

  setDailyReset: (enabled) => {
    AsyncStorage.setItem(DAILY_RESET_KEY, enabled ? "true" : "false");
    set({ isDailyResetEnabled: enabled });
  },
}));

/**
 * Check if it's a new day and clear ALL tasks (fresh list each day).
 * Call this on app launch.
 */
export async function checkDailyReset(clearAll: () => void) {
  try {
    const [resetEnabled, lastReset] = await Promise.all([
      AsyncStorage.getItem(DAILY_RESET_KEY),
      AsyncStorage.getItem(LAST_RESET_KEY),
    ]);

    if (resetEnabled !== "true") return;

    const today = new Date().toDateString();
    if (lastReset !== today) {
      // New day — wipe the entire list, start fresh
      clearAll();
      await AsyncStorage.setItem(LAST_RESET_KEY, today);
    }
  } catch {
    // silently fail
  }
}

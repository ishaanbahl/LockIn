/**
 * Screen Time Service
 *
 * Wraps the native ScreenTime Expo module with a clean API
 * that the rest of the app uses. All calls are safe no-ops
 * when running in Expo Go or on non-iOS platforms.
 *
 * When running as a dev build with the native module:
 * - requestAuthorization() → prompts for FamilyControls
 * - presentAppPicker() → shows Apple's app selection UI
 * - blockApps() → shields the selected apps
 * - unblockAllApps() → removes all shields
 */

import {
  requestAuthorization as nativeRequestAuth,
  isAuthorized as nativeIsAuth,
  presentAppPicker as nativePresentPicker,
  blockSelectedApps as nativeBlockApps,
  unblockAllApps as nativeUnblockAll,
  getBlockedAppCount as nativeGetCount,
} from "../modules/screen-time-module";

export interface ScreenTimeService {
  requestAuthorization: () => Promise<boolean>;
  presentAppPicker: () => Promise<boolean>;
  blockApps: () => Promise<void>;
  unblockAllApps: () => Promise<void>;
  isAuthorized: () => Promise<boolean>;
  getBlockedAppCount: () => Promise<number>;
}

export const screenTimeService: ScreenTimeService = {
  requestAuthorization: async () => {
    try {
      return await nativeRequestAuth();
    } catch (error) {
      if (__DEV__) {
        console.log("[ScreenTime] Auth not available (Expo Go):", error);
      }
      return false;
    }
  },

  presentAppPicker: async () => {
    try {
      return await nativePresentPicker();
    } catch (error) {
      if (__DEV__) {
        console.log("[ScreenTime] App picker not available (Expo Go):", error);
      }
      return false;
    }
  },

  blockApps: async () => {
    try {
      await nativeBlockApps();
    } catch (error) {
      if (__DEV__) {
        console.log("[ScreenTime] Block not available (Expo Go):", error);
      }
    }
  },

  unblockAllApps: async () => {
    try {
      await nativeUnblockAll();
    } catch (error) {
      if (__DEV__) {
        console.log("[ScreenTime] Unblock not available (Expo Go):", error);
      }
    }
  },

  isAuthorized: async () => {
    try {
      return await nativeIsAuth();
    } catch {
      return false;
    }
  },

  getBlockedAppCount: async () => {
    try {
      return await nativeGetCount();
    } catch {
      return 0;
    }
  },
};

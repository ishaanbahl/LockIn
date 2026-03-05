import { requireNativeModule, Platform } from "expo-modules-core";

/**
 * Screen Time Native Module
 *
 * Bridges iOS FamilyControls + ManagedSettings + DeviceActivity
 * frameworks to React Native via Expo Modules API.
 *
 * On non-iOS platforms, all methods are safe no-ops.
 */

interface ScreenTimeModuleType {
  requestAuthorization(): Promise<boolean>;
  isAuthorized(): Promise<boolean>;
  presentAppPicker(): Promise<boolean>;
  blockSelectedApps(): Promise<boolean>;
  unblockAllApps(): Promise<boolean>;
  getBlockedAppCount(): Promise<number>;
  reapplyShieldsIfNeeded(): Promise<boolean>;
}

// Only load the native module on iOS
const NativeModule: ScreenTimeModuleType | null =
  Platform.OS === "ios"
    ? requireNativeModule("ScreenTimeExpoModule")
    : null;

/**
 * Request FamilyControls authorization.
 * Must be called before any other Screen Time API.
 */
export async function requestAuthorization(): Promise<boolean> {
  if (!NativeModule) {
    console.log("[ScreenTime] Not available on this platform");
    return false;
  }
  return NativeModule.requestAuthorization();
}

/**
 * Check if FamilyControls is currently authorized.
 */
export async function isAuthorized(): Promise<boolean> {
  if (!NativeModule) return false;
  return NativeModule.isAuthorized();
}

/**
 * Present Apple's FamilyActivityPicker so the user can select apps to block.
 * Returns true if the user made a selection, false if cancelled.
 */
export async function presentAppPicker(): Promise<boolean> {
  if (!NativeModule) {
    console.log("[ScreenTime] App picker not available on this platform");
    return false;
  }
  return NativeModule.presentAppPicker();
}

/**
 * Block all apps the user previously selected via the app picker.
 * Sets up the ManagedSettings shield on those apps.
 */
export async function blockSelectedApps(): Promise<boolean> {
  if (!NativeModule) return false;
  return NativeModule.blockSelectedApps();
}

/**
 * Remove all shields / unblock all apps.
 * Called when all tasks are completed.
 */
export async function unblockAllApps(): Promise<boolean> {
  if (!NativeModule) return false;
  return NativeModule.unblockAllApps();
}

/**
 * Get the number of currently blocked apps.
 */
export async function getBlockedAppCount(): Promise<number> {
  if (!NativeModule) return 0;
  return NativeModule.getBlockedAppCount();
}

/**
 * Re-apply shields if they were bypassed via "Continue Anyway".
 * Call this when the app becomes active / foregrounded.
 */
export async function reapplyShieldsIfNeeded(): Promise<boolean> {
  if (!NativeModule) return false;
  return NativeModule.reapplyShieldsIfNeeded();
}

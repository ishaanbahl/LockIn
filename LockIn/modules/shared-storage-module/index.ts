import { requireNativeModule, Platform } from "expo-modules-core";

/**
 * Shared Storage Native Module
 *
 * Reads/writes to App Group UserDefaults so the main app and
 * Shield Configuration Extension can share data (task list).
 */

interface SharedStorageModuleType {
  syncTasks(taskTitles: string[]): Promise<boolean>;
  clearTasks(): Promise<boolean>;
  getTaskTitles(): Promise<string[]>;
}

const NativeModule: SharedStorageModuleType | null =
  Platform.OS === "ios"
    ? requireNativeModule("SharedStorageExpoModule")
    : null;

/**
 * Sync incomplete task titles to shared storage.
 * The Shield Extension reads these to display the task list
 * when a blocked app is opened.
 */
export async function syncTasks(taskTitles: string[]): Promise<boolean> {
  if (!NativeModule) {
    if (__DEV__) {
      console.log("[SharedStorage] Would sync:", taskTitles.length, "tasks");
    }
    return false;
  }
  return NativeModule.syncTasks(taskTitles);
}

/**
 * Clear all tasks from shared storage.
 * Called when all tasks are completed.
 */
export async function clearTasks(): Promise<boolean> {
  if (!NativeModule) return false;
  return NativeModule.clearTasks();
}

/**
 * Read task titles from shared storage (used by extension).
 */
export async function getTaskTitles(): Promise<string[]> {
  if (!NativeModule) return [];
  return NativeModule.getTaskTitles();
}

/**
 * Shared Storage Service
 *
 * Syncs incomplete tasks to App Groups shared UserDefaults so the
 * Shield Configuration Extension can display them when a blocked
 * app is opened.
 *
 * The shield screen reads these to show:
 * "You still have 3 tasks left:
 *  • Buy groceries
 *  • Finish essay
 *  • Call dentist
 * Are you sure you want to continue?"
 */

import {
  syncTasks as nativeSyncTasks,
  clearTasks as nativeClearTasks,
} from "../modules/shared-storage-module";
import { Task } from "../types/task";

/**
 * Sync incomplete tasks to shared storage so the shield extension
 * can display them. Call this every time tasks change.
 */
export async function syncTasksToSharedStorage(tasks: Task[]) {
  const incompleteTitles = tasks
    .filter((t) => !t.isCompleted)
    .map((t) => t.title);

  try {
    await nativeSyncTasks(incompleteTitles);
  } catch (error) {
    if (__DEV__) {
      console.log(
        "[SharedStorage] Sync not available (Expo Go):",
        incompleteTitles.length,
        "tasks"
      );
    }
  }
}

/**
 * Clear shared storage (called when all tasks are done)
 */
export async function clearSharedStorage() {
  try {
    await nativeClearTasks();
  } catch (error) {
    if (__DEV__) {
      console.log("[SharedStorage] Clear not available (Expo Go)");
    }
  }
}

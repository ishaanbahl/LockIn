import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Task } from "../types/task";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission to send local notifications.
 * Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Build a Date object for today at the given HH:mm string,
 * minus `minutesBefore` minutes. Returns null if the time has already passed.
 */
function getReminderDate(dueTime: string, minutesBefore: number): Date | null {
  const [h, m] = dueTime.split(":").map(Number);
  const now = new Date();
  const reminder = new Date();
  reminder.setHours(h, m, 0, 0);
  reminder.setMinutes(reminder.getMinutes() - minutesBefore);

  // If the reminder time has already passed today, skip it
  if (reminder <= now) return null;
  return reminder;
}

/**
 * Schedule a local notification 1 hour before a task's due time.
 * Uses the task ID as the notification identifier for easy cancellation.
 */
export async function scheduleTaskReminder(task: Task): Promise<void> {
  if (!task.dueTime) return;

  // Cancel any existing reminder for this task first
  await cancelTaskReminder(task.id);

  const reminderDate = getReminderDate(task.dueTime, 1); // TESTING: 1 minute before (change back to 60 for production)
  if (!reminderDate) return; // Already passed

  await Notifications.scheduleNotificationAsync({
    identifier: task.id,
    content: {
      title: "Task Reminder ⏰",
      body: `"${task.title}" is due in 1 hour.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

/**
 * Cancel a scheduled notification for a specific task.
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(taskId);
}

/**
 * Reschedule reminders for all tasks that have due times.
 * Call this on app launch and after bulk edits.
 */
export async function rescheduleAllReminders(tasks: Task[]): Promise<void> {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Reschedule for all tasks with due times that aren't completed
  for (const task of tasks) {
    if (task.dueTime && !task.isCompleted) {
      await scheduleTaskReminder(task);
    }
  }
}

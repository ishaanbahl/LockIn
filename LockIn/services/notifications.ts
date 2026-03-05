import * as Notifications from "expo-notifications";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule a persistent "you have tasks left" reminder
 */
export async function scheduleTaskReminder(taskCount: number) {
  // Cancel existing reminders first
  await cancelAllReminders();

  if (taskCount === 0) return;

  // Repeat every 2 hours
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔒 You still have tasks left",
      body: `${taskCount} task${taskCount === 1 ? "" : "s"} remaining. Finish them to unlock your apps!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2 * 60 * 60, // 2 hours
      repeats: true,
    },
  });
}

/**
 * Schedule a morning summary notification
 */
export async function scheduleMorningSummary(hour: number = 8, minute: number = 0) {
  await Notifications.scheduleNotificationAsync({
    identifier: "morning-summary",
    content: {
      title: "☀️ Good morning!",
      body: "Check your tasks for today and stay on track.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Send an immediate "all done" celebration notification
 */
export async function sendCompletionNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 All tasks complete!",
      body: "You're free! Your apps are unlocked. Enjoy your break.",
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Cancel all scheduled reminders
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

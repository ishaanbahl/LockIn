import * as Notifications from "expo-notifications";
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
 * Lead times (in minutes) for which we schedule a reminder group per due time.
 * Each task group therefore produces up to two notifications.
 */
const LEAD_TIMES = [60, 5] as const;

/**
 * Identifier + fire time for the daily morning summary notification.
 */
const MORNING_SUMMARY_ID = "morning-summary";
const MORNING_SUMMARY_HOUR = 7;
const MORNING_SUMMARY_MINUTE = 0;

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
  const reminder = new Date();
  reminder.setHours(h, m, 0, 0);
  reminder.setMinutes(reminder.getMinutes() - minutesBefore);

  if (reminder <= new Date()) return null;
  return reminder;
}

/**
 * Notification identifier for a given due-time group + lead time.
 * Keyed on HH:mm and minutesBefore so each lead time has its own slot
 * (and re-scheduling replaces the right one).
 */
function groupId(dueTime: string, minutesBefore: number): string {
  return `reminder-group-${dueTime}-${minutesBefore}`;
}

/**
 * Format a minutes lead time as human-readable text ("1 hour", "5 minutes").
 */
function formatLeadTime(minutesBefore: number): string {
  if (minutesBefore >= 60 && minutesBefore % 60 === 0) {
    const hours = minutesBefore / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${minutesBefore} ${minutesBefore === 1 ? "minute" : "minutes"}`;
}

/**
 * Build the notification body from a list of task titles.
 * e.g. "Finish report, Read emails, Call dentist are due in 5 minutes."
 */
export function buildReminderBody(titles: string[], minutesBefore: number): string {
  if (titles.length === 0) return "";
  const joined = titles.join(", ");
  const verb = titles.length === 1 ? "is" : "are";
  return `${joined} ${verb} due in ${formatLeadTime(minutesBefore)}.`;
}

/**
 * Schedule (or replace) the grouped notifications for a specific due time.
 * One notification per entry in `LEAD_TIMES` (e.g. 60-min and 5-min warnings).
 */
async function scheduleGroupForTime(dueTime: string, allTasks: Task[]): Promise<void> {
  // Always cancel any previously scheduled notifications for this time slot.
  await Promise.all(
    LEAD_TIMES.map((lead) =>
      Notifications.cancelScheduledNotificationAsync(groupId(dueTime, lead))
    )
  );

  const due = allTasks.filter((t) => t.dueTime === dueTime && !t.isCompleted);
  if (due.length === 0) return;

  const titles = due.map((t) => t.title).filter(Boolean);
  if (titles.length === 0) return;

  for (const lead of LEAD_TIMES) {
    const reminderDate = getReminderDate(dueTime, lead);
    if (!reminderDate) continue; // lead time already passed — skip this one

    await Notifications.scheduleNotificationAsync({
      identifier: groupId(dueTime, lead),
      content: {
        title: "Lok: Task Reminder ⏰",
        body: buildReminderBody(titles, lead),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
  }
}

/**
 * Schedule reminders for the task's due-time group.
 * Pass the full current task list so the body lists all sibling tasks.
 */
export async function scheduleTaskReminder(task: Task, allTasks: Task[]): Promise<void> {
  if (!task.dueTime) return;
  await scheduleGroupForTime(task.dueTime, allTasks);
}

/**
 * Cancel and re-schedule the reminder group for a given due time,
 * excluding the task that was removed or completed.
 */
export async function cancelTaskReminder(
  taskId: string,
  dueTime: string | undefined,
  allTasks: Task[]
): Promise<void> {
  if (!dueTime) return;
  // Re-build the group without this task (it may already be excluded from allTasks)
  await scheduleGroupForTime(dueTime, allTasks.filter((t) => t.id !== taskId));
}

/**
 * Static copy for the daily morning summary notification.
 * Edit `MORNING_SUMMARY_TITLE` / `MORNING_SUMMARY_BODY` to change what users see.
 */
export const MORNING_SUMMARY_TITLE = "Good morning! ☀️";
export const MORNING_SUMMARY_BODY = "Reminder to update your to-do list for the day!";

/**
 * Schedule (or replace) a daily notification at 7:00 AM with a static body.
 */
export async function scheduleMorningSummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_SUMMARY_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: MORNING_SUMMARY_ID,
    content: {
      title: MORNING_SUMMARY_TITLE,
      body: MORNING_SUMMARY_BODY,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: MORNING_SUMMARY_HOUR,
      minute: MORNING_SUMMARY_MINUTE,
    },
  });
}

/**
 * Reschedule reminders for all tasks that have due times.
 * Groups tasks by due time so each time slot gets both the 1-hour and
 * 5-minute warnings, each listing all tasks due then. Also refreshes
 * the daily 7 AM morning summary.
 *
 * Call this on app launch and after bulk edits.
 */
export async function rescheduleAllReminders(tasks: Task[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const uniqueTimes = [
    ...new Set(
      tasks.filter((t) => t.dueTime && !t.isCompleted).map((t) => t.dueTime!)
    ),
  ];

  for (const dueTime of uniqueTimes) {
    await scheduleGroupForTime(dueTime, tasks);
  }

  await scheduleMorningSummary();
}

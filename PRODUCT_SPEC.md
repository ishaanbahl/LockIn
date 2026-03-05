# 📵 LockIn — MVP Product Spec

> *Finish your tasks before you scroll.*

---

## 🧠 Core Concept

A to-do list app that **actively discourages phone usage** until all tasks are checked off. If you have incomplete tasks, the app sends persistent reminders and leverages iOS Screen Time APIs to block distracting apps (social media, games, etc.). Once your list is clear — your phone unlocks fully.

---

## 🎯 Target User

- Students (high school / college) who procrastinate on homework
- Young professionals who lose hours to social media
- Anyone who wants a forcing function to stay productive

---

## 🏗️ MVP Features (v1.0)

### 1. Task Management (Core)
| Feature | Details |
|---|---|
| Add task | Title + optional due date |
| Check off task | Tap to mark complete (satisfying animation) |
| Delete / edit task | Swipe to delete, tap to edit |
| Task list view | Clean, minimal list sorted by due date |
| Daily reset option | Option to auto-clear completed tasks at midnight |

### 2. App Blocking — Soft Block with Task List (Key Differentiator)
| Feature | Details |
|---|---|
| Blocklist setup | User picks which apps to block (e.g. Instagram, TikTok, YouTube, X, Reddit) |
| Auto-block trigger | When ≥1 task is incomplete, blocked apps show the shield screen |
| Auto-unblock | When all tasks are checked off, shields are removed — apps open normally |
| Shield screen | Shows **actual remaining task list**: "You still have 3 tasks left: • Buy groceries • Finish essay • Call dentist" |
| "Continue Anyway" | Soft block — user can bypass with a secondary button (creates friction/guilt, not a prison) |
| "Open LockIn" button | Primary button on shield opens the app so user can check off tasks |
| Shared storage | Tasks synced between main app and shield extension via App Groups (shared UserDefaults) |
| Uses iOS Screen Time API | `FamilyControls` + `ManagedSettings` + `DeviceActivity` + `ShieldConfiguration` + `ShieldAction` |

### 3. Reminders / Nudges
| Feature | Details |
|---|---|
| Persistent notification | "You still have X tasks left" — sent at user-chosen intervals |
| Smart timing | Remind when user picks up phone (via `DeviceActivity` monitor) |
| Morning summary | Push notification at wake-up time: "Here's your list for today" |
| Escalating nudges | Reminders get more frequent the longer tasks sit incomplete |

### 4. Onboarding
| Feature | Details |
|---|---|
| Screen Time permission | Guide user through granting Screen Time / Family Controls access |
| Notification permission | Request push notification access |
| Pick your poison | Let user select which apps to block on first launch |
| Add first tasks | Prompt user to add 1-3 tasks to start |

---

## 🚫 NOT in MVP (v2+ Ideas)

| Feature | Why Later |
|---|---|
| Social / accountability partners | Adds complexity, need user base first |
| Habit streaks / gamification | Nice-to-have, not core |
| Recurring tasks | Can add after validating core loop |
| Widget | Great for engagement but not day-one |
| Focus modes / categories | Keep it simple — one list |
| AI task suggestions | Novelty, not core value |
| Apple Watch app | Platform expansion |
| Custom block schedules | "Block only 9am–5pm" — adds settings complexity |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native (Expo managed → dev build) |
| **Language** | TypeScript |
| **UI** | React Native + Expo Router (file-based navigation) |
| **Data Persistence** | `expo-sqlite` or `@react-native-async-storage/async-storage` |
| **App Blocking** | Custom native module (Swift) bridging `FamilyControls` + `ManagedSettings` + `DeviceActivity` — **no existing RN library, must write native bridge** |
| **Notifications** | `expo-notifications` (local push) |
| **State Management** | Zustand (lightweight) |
| **Architecture** | Feature-based folder structure |
| **Min iOS Version** | iOS 17+ |
| **Backend** | None (fully on-device for MVP) |

> ⚠️ **Native Bridge Required**: The Screen Time APIs (`FamilyControls`, `ManagedSettings`, `DeviceActivity`) are iOS-only native frameworks with **zero** existing React Native libraries. You'll need to write a custom Swift native module and bridge it to RN. This also means you need an **Expo dev build** (not Expo Go) to run on device. The Shield Configuration Extension and Device Activity Monitor Extension must still be written in Swift as separate Xcode targets.

---

## 📱 Screen Map

```
┌─────────────────────────────────────────┐
│              ONBOARDING                 │
│  1. Welcome / value prop                │
│  2. Grant Screen Time permission        │
│  3. Grant notification permission       │
│  4. Pick apps to block                  │
│  5. Add your first tasks               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            MAIN TASK LIST               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ○  Buy groceries          Today │    │
│  │ ○  Finish essay        Tomorrow │    │
│  │ ✓  Call dentist      (done)     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [ + Add Task ]                         │
│                                         │
│  Status Bar: "2 tasks left · 🔒 Apps    │
│              blocked"                   │
│                                         │
│  ───────────────────────────────────    │
│  Tab: Tasks    |    Settings            │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌──────────────┐ ┌───────────────────────┐
│  ADD TASK    │ │      SETTINGS         │
│  SHEET       │ │                       │
│              │ │  • Blocked apps list  │
│  Title _____ │ │  • Reminder frequency │
│  Due   _____ │ │  • Morning summary    │
│              │ │    time               │
│  [Save]      │ │  • Daily reset toggle │
│              │ │  • About / Support    │
└──────────────┘ └───────────────────────┘

┌─────────────────────────────────────────┐
│          SHIELD SCREEN                  │
│  (shown when blocked app is opened)     │
│                                         │
│              🔒                         │
│                                         │
│   You still have 3 tasks left:         │
│                                         │
│     • Buy groceries                    │
│     • Finish essay                     │
│     • Call dentist                     │
│                                         │
│   Are you sure you want to keep        │
│   scrolling?                           │
│                                         │
│   ┌─────────────────────────────┐      │
│   │      Open LockIn →         │      │
│   └─────────────────────────────┘      │
│                                         │
│        Continue Anyway                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔑 Key iOS APIs & How They Fit (Native Bridge Layer)

> These are all **Swift-only** APIs. You'll write a Swift native module that exposes methods to React Native via `RCT_EXTERN_METHOD` / the new architecture TurboModules.

### FamilyControls Framework
- **What**: Grants authorization to monitor and restrict app usage
- **How**: Call `AuthorizationCenter.shared.requestAuthorization(for: .individual)` during onboarding
- **RN Bridge**: Expose `requestScreenTimeAuth()` → returns `Promise<boolean>`
- **Why**: Required gateway to use Screen Time APIs

### ManagedSettings Framework
- **What**: Lets you block/allow specific apps and set shield screens
- **How**: Create a `ManagedSettingsStore`, set `store.shield.applications = blockedApps`
- **RN Bridge**: Expose `blockApps(tokenData)` and `unblockAllApps()`
- **Why**: This is what actually blocks the apps and shows the "finish your tasks" screen

### DeviceActivity Framework
- **What**: Monitor device activity events (app opens, screen time, schedules)
- **How**: Use `DeviceActivityMonitor` to detect when the user picks up their phone
- **RN Bridge**: This one runs as a **separate extension target** — it communicates with the main app via App Groups / shared UserDefaults
- **Why**: Trigger reminders when user is actively using phone with incomplete tasks

### FamilyActivityPicker (App Selection UI)
- **What**: Apple's built-in UI for selecting which apps to block
- **How**: Present `FamilyActivityPicker` as a SwiftUI view
- **RN Bridge**: Expose as a native UI component via `requireNativeComponent` or present it modally from Swift and return selected tokens
- **Why**: Apple requires you use their picker — you can't list apps yourself

### expo-notifications
- **What**: Local push notifications (cross-platform)
- **How**: Schedule repeating notifications via Expo's notification API — no native bridge needed
- **Why**: Nudge the user even when the app isn't open

---

## 📊 MVP Success Metrics

| Metric | Target |
|---|---|
| Daily active users (DAU) | Track growth week over week |
| Task completion rate | >70% of added tasks get checked off |
| Avg. tasks per user per day | 3-5 |
| Retention (Day 7) | >40% |
| Screen Time permission granted | >80% of onboarded users |
| App Store rating | ≥4.5 stars |

---

## 🗓️ Suggested Build Timeline (Solo Dev)

| Week | Milestone |
|---|---|
| **Week 1** | Expo project setup, TypeScript config, task list CRUD UI, AsyncStorage/SQLite models |
| **Week 2** | Write Swift native module bridging FamilyControls + ManagedSettings to RN |
| **Week 3** | Shield Configuration Extension + Device Activity Monitor Extension (Swift, Xcode targets) |
| **Week 4** | Wire native module into RN — auto-block/unblock on task state changes |
| **Week 5** | Notifications system via `expo-notifications` (reminders, morning summary, escalation) |
| **Week 6** | Onboarding flow, permissions, app-picker UI via native module |
| **Week 7** | Settings screen, polish, animations (react-native-reanimated), edge cases |
| **Week 8** | Testing on device via Expo dev build, TestFlight beta |
| **Week 9** | App Store submission, landing page, launch prep |

---

## ⚠️ Important Considerations

1. **Screen Time API requires Apple approval** — You need to apply for the `com.apple.developer.family-controls` entitlement. Apple reviews these requests. Apply early.

2. **Shield Extension** — The custom "finish your tasks" screen when a blocked app is opened runs as a **Shield Configuration Extension** (separate target in Xcode). Plan for this.

3. **Device Activity Monitor Extension** — Runs as a separate extension target too. It monitors in the background even when your app isn't running.

4. **No App Store screenshots showing real app icons** — Apple may reject if your shield screen shows identifiable third-party app icons.

5. **Privacy** — All data stays on-device for MVP. This is a selling point — market it.

6. **Bypass risk** — Users can disable Screen Time in Settings. You can't prevent this, but you can detect it and show a "re-enable" prompt. Don't try to be un-removable — Apple will reject you.

---

## 💰 Monetization Ideas (Post-MVP)

| Model | Details |
|---|---|
| **Freemium** | Free: 3 blocked apps, basic reminders. Pro: unlimited blocks, smart nudges, stats |
| **One-time purchase** | $4.99 lifetime unlock — simple, user-friendly |
| **Subscription** | $1.99/mo or $9.99/yr for Pro features |

---

## 📂 Project Structure

```
LockIn/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (tab navigator)
│   ├── index.tsx               # Main task list screen
│   ├── settings.tsx            # Settings screen
│   └── onboarding/
│       ├── _layout.tsx
│       ├── welcome.tsx
│       ├── permissions.tsx
│       ├── pick-apps.tsx
│       └── first-tasks.tsx
├── components/
│   ├── TaskItem.tsx            # Single task row
│   ├── AddTaskSheet.tsx        # Bottom sheet to add/edit task
│   ├── StatusBar.tsx           # "X tasks left · 🔒 blocked" bar
│   └── EmptyState.tsx          # "All done!" celebration view
├── store/
│   └── taskStore.ts            # Zustand store for task state
├── services/
│   ├── screenTime.ts           # JS wrapper around native module
│   └── notifications.ts        # expo-notifications helpers
├── native/                     # Swift native module source
│   ├── ScreenTimeModule.swift  # RN bridge for FamilyControls + ManagedSettings
│   └── ScreenTimeModule.m      # Obj-C bridge header (RCT_EXTERN_MODULE)
├── types/
│   └── task.ts                 # TypeScript type definitions
├── constants/
│   └── theme.ts                # Colors, fonts, spacing
├── app.json                    # Expo config
├── tsconfig.json
└── package.json
```

---

## 🏁 Next Steps

1. **Run `npx create-expo-app LockIn`** to initialize the Expo project
2. Build the task list UI + Zustand store (pure RN, no native code needed)
3. **Apply for Apple's `com.apple.developer.family-controls` entitlement** — do this NOW, it takes days/weeks
4. Write the Swift native module to bridge Screen Time APIs
5. Add the Shield Configuration Extension + Device Activity Monitor Extension as Xcode targets
6. Wire everything together and test on a real device via Expo dev build

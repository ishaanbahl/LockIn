import DeviceActivity
import ManagedSettings
import Foundation

/// Device Activity Monitor Extension
///
/// Monitors device activity events in the background, even when the
/// main app isn't running. This extension:
///
/// - Detects when a monitoring interval starts/ends
/// - Can re-apply shields if the user has incomplete tasks
/// - Runs as a separate Xcode extension target
///
/// Target setup:
/// 1. File → New → Target → Device Activity Monitor Extension
/// 2. Name it "DeviceActivityMonitor"
/// 3. Set the App Group to "group.com.lockin.app"
/// 4. Bundle ID: "com.lockin.app.DeviceActivityMonitor"

class LockInDeviceActivityMonitor: DeviceActivityMonitor {

    private let appGroupID = "group.com.ishaanbahl.lockin"
    private let taskCountKey = "incompleteTaskCount"
    private let selectedAppsKey = "selectedFamilyActivitySelection"

    // Store for applying/removing shields
    private let store = ManagedSettingsStore()

    // MARK: - Interval Started

    /// Called when a monitored interval begins (e.g. start of day).
    /// We check if there are incomplete tasks and re-apply shields.
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        print("[DeviceActivity] Interval started: \(activity.rawValue)")
        reapplyShieldsIfNeeded()
    }

    // MARK: - Interval Ended

    /// Called when a monitored interval ends (e.g. end of day / midnight).
    /// This is where daily reset could trigger — remove all shields.
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        print("[DeviceActivity] Interval ended: \(activity.rawValue)")

        // At end of day, clear shields (fresh day)
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
    }

    // MARK: - Event Triggered

    /// Called when a specific event threshold is reached.
    override func eventDidReachThreshold(
        _ event: DeviceActivityEvent.Name,
        activity: DeviceActivityName
    ) {
        super.eventDidReachThreshold(event, activity: activity)
        print("[DeviceActivity] Event reached threshold: \(event.rawValue)")
    }

    // MARK: - Interval Will Start Warning

    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)
        print("[DeviceActivity] Interval will start: \(activity.rawValue)")
    }

    // MARK: - Interval Will End Warning

    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)
        print("[DeviceActivity] Interval will end: \(activity.rawValue)")
    }

    // MARK: - Helpers

    /// Check if there are incomplete tasks and re-apply shields
    private func reapplyShieldsIfNeeded() {
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }

        let taskCount = defaults.integer(forKey: taskCountKey)

        if taskCount > 0 {
            // There are incomplete tasks — re-apply shields
            if #available(iOS 16.0, *) {
                if let data = defaults.data(forKey: selectedAppsKey),
                   let selection = try? JSONDecoder().decode(
                    FamilyActivitySelection.self,
                    from: data
                   ) {
                    store.shield.applications = selection.applicationTokens.isEmpty
                        ? nil
                        : selection.applicationTokens

                    store.shield.applicationCategories = selection.categoryTokens.isEmpty
                        ? nil
                        : .specific(selection.categoryTokens)

                    store.shield.webDomains = selection.webDomainTokens.isEmpty
                        ? nil
                        : selection.webDomainTokens

                    print("[DeviceActivity] Re-applied shields for \(taskCount) incomplete tasks")
                }
            }
        } else {
            // All tasks done — remove shields
            store.shield.applications = nil
            store.shield.applicationCategories = nil
            store.shield.webDomains = nil
            print("[DeviceActivity] No tasks — shields removed")
        }
    }
}

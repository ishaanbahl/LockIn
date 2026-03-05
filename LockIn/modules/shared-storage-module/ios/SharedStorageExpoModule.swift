import ExpoModulesCore

/// Expo native module for reading/writing to App Group UserDefaults.
///
/// This allows the main app and the Shield Configuration Extension
/// to share data — specifically the list of incomplete tasks that
/// the shield screen displays when a blocked app is opened.
public class SharedStorageExpoModule: Module {

    private let appGroupID = "group.com.ishaanbahl.lockin"
    private let taskTitlesKey = "incompleteTasks"
    private let taskCountKey = "incompleteTaskCount"

    public func definition() -> ModuleDefinition {
        Name("SharedStorageExpoModule")

        // MARK: - Sync Tasks
        // Write incomplete task titles to shared UserDefaults
        AsyncFunction("syncTasks") { (taskTitles: [String]) -> Bool in
            guard let defaults = UserDefaults(suiteName: self.appGroupID) else {
                print("[SharedStorage] Failed to access App Group")
                return false
            }

            defaults.set(taskTitles, forKey: self.taskTitlesKey)
            defaults.set(taskTitles.count, forKey: self.taskCountKey)
            defaults.synchronize()

            print("[SharedStorage] Synced \(taskTitles.count) tasks to shared storage")
            return true
        }

        // MARK: - Clear Tasks
        // Remove all task data from shared storage
        AsyncFunction("clearTasks") { () -> Bool in
            guard let defaults = UserDefaults(suiteName: self.appGroupID) else {
                return false
            }

            defaults.removeObject(forKey: self.taskTitlesKey)
            defaults.set(0, forKey: self.taskCountKey)
            defaults.synchronize()

            print("[SharedStorage] Cleared shared storage")
            return true
        }

        // MARK: - Get Task Titles
        // Read task titles (can be called from main app or extension)
        AsyncFunction("getTaskTitles") { () -> [String] in
            guard let defaults = UserDefaults(suiteName: self.appGroupID) else {
                return []
            }
            return defaults.stringArray(forKey: self.taskTitlesKey) ?? []
        }
    }
}

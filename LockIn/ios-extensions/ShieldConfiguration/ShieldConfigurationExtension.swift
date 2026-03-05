import ManagedSettings
import ManagedSettingsUI
import UIKit

/// Shield Configuration Extension
///
/// This extension provides the custom UI shown when the user tries to
/// open a blocked app. It displays:
/// - A lock icon
/// - The list of incomplete tasks (read from App Group UserDefaults)
/// - "Open LockIn" as the primary action
/// - "Continue Anyway" as the secondary action (soft block)
///
/// IMPORTANT: This runs as a separate Xcode target, NOT inside the main app.
/// It must be added as an extension target in Xcode after `expo prebuild`.
///
/// Target setup:
/// 1. File → New → Target → Shield Configuration Extension
/// 2. Name it "ShieldConfiguration"
/// 3. Set the App Group to "group.com.lockin.app"
/// 4. Bundle ID: "com.lockin.app.ShieldConfiguration"

class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    private let appGroupID = "group.com.ishaanbahl.lockin"
    private let taskTitlesKey = "incompleteTasks"
    private let taskCountKey = "incompleteTaskCount"

    // MARK: - Shield for Application

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    // MARK: - Shield for Application Category

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    // MARK: - Shield for Web Domain

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfiguration()
    }

    // MARK: - Build Shield UI

    private func buildShieldConfiguration() -> ShieldConfiguration {
        let tasks = getIncompleteTasks()
        let taskCount = tasks.count

        // Build the subtitle showing the task list
        var subtitle: String
        if taskCount == 0 {
            subtitle = "You have tasks to finish first."
        } else {
            let taskList = tasks.prefix(5).map { "• \($0)" }.joined(separator: "\n")
            subtitle = "You still have \(taskCount) task\(taskCount == 1 ? "" : "s") left:\n\n\(taskList)"

            if taskCount > 5 {
                subtitle += "\n  ...and \(taskCount - 5) more"
            }

            subtitle += "\n\nFinish your tasks, then come back."
        }

        // Colors matching the app's dark theme
        let backgroundColor = UIColor(red: 0.05, green: 0.05, blue: 0.05, alpha: 1.0) // #0D0D0D
        let primaryColor = UIColor(red: 0.42, green: 0.36, blue: 0.91, alpha: 1.0)    // #6C5CE7

        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: backgroundColor,
            icon: UIImage(systemName: "lock.fill"),
            title: ShieldConfiguration.Label(
                text: "🔒 Lock In First",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: UIColor(white: 0.7, alpha: 1.0)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Open LockIn →",
                color: .white
            ),
            primaryButtonBackgroundColor: primaryColor,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Continue Anyway",
                color: UIColor(white: 0.5, alpha: 1.0)
            )
        )
    }

    // MARK: - Read Tasks from App Group

    private func getIncompleteTasks() -> [String] {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            return []
        }
        return defaults.stringArray(forKey: taskTitlesKey) ?? []
    }
}

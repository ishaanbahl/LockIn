import ManagedSettings
import ManagedSettingsUI
import UIKit

/// Shield Action Extension
///
/// Handles what happens when the user taps the primary or secondary
/// buttons on the shield screen.
///
/// - Primary ("Open LockIn →"): Opens the LockIn app via URL scheme
/// - Secondary ("Continue Anyway"): Dismisses the shield and lets the user
///   continue to the blocked app (soft block)
///
/// This runs in the same extension target as ShieldConfigurationExtension.

class ShieldActionHandler: ShieldActionDelegate {

    // MARK: - Handle Shield Actions

    override func handle(
        action: ShieldAction,
        for application: ApplicationToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            // Open the LockIn app via URL scheme
            completionHandler(.defer)

        case .secondaryButtonPressed:
            // Soft block — let them through
            completionHandler(.close)

        @unknown default:
            completionHandler(.close)
        }
    }

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomainToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.defer)
        case .secondaryButtonPressed:
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }

    override func handle(
        action: ShieldAction,
        for category: ActivityCategoryToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.defer)
        case .secondaryButtonPressed:
            completionHandler(.close)
        @unknown default:
            completionHandler(.close)
        }
    }
}

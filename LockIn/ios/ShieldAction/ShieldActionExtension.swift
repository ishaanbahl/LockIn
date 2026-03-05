//
//  ShieldActionExtension.swift
//  ShieldAction
//
//  Created by Ishaan Bahl on 2026-03-01.
//

import Foundation
import ManagedSettings

// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.
class ShieldActionExtension: ShieldActionDelegate {

    private let store = ManagedSettingsStore()
    private let appGroupID = "group.com.ishaanbahl.lockin"

    // MARK: - Application Shield Actions

    override func handle(
        action: ShieldAction,
        for application: ApplicationToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.close)

        case .secondaryButtonPressed:
            removeAllShields()
            // Small delay so the store change propagates before iOS re-evaluates
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                completionHandler(.defer)
            }

        @unknown default:
            completionHandler(.close)
        }
    }

    // MARK: - Web Domain Shield Actions

    override func handle(
        action: ShieldAction,
        for webDomain: WebDomainToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.close)
        case .secondaryButtonPressed:
            removeAllShields()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                completionHandler(.defer)
            }
        @unknown default:
            completionHandler(.close)
        }
    }

    // MARK: - Category Shield Actions

    override func handle(
        action: ShieldAction,
        for category: ActivityCategoryToken,
        completionHandler: @escaping (ShieldActionResponse) -> Void
    ) {
        switch action {
        case .primaryButtonPressed:
            completionHandler(.close)
        case .secondaryButtonPressed:
            removeAllShields()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                completionHandler(.defer)
            }
        @unknown default:
            completionHandler(.close)
        }
    }

    // MARK: - Remove Shields

    private func removeAllShields() {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil

        // Flag so the main app knows to re-apply shields
        if let defaults = UserDefaults(suiteName: appGroupID) {
            defaults.set(true, forKey: "shieldsBypassed")
        }
    }
}

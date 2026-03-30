//
//  ShieldActionExtension.swift
//  ShieldAction
//
//  Created by Ishaan Bahl on 2026-03-01.
//

import Foundation
import ManagedSettings
import FamilyControls

class ShieldActionExtension: ShieldActionDelegate {

    private let store = ManagedSettingsStore()
    private let appGroupID = "group.com.ishaanbahl.lockin"
    private let selectedAppsKey = "selectedFamilyActivitySelection"

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
            bypass(completionHandler: completionHandler)
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
            bypass(completionHandler: completionHandler)
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
            bypass(completionHandler: completionHandler)
        @unknown default:
            completionHandler(.close)
        }
    }

    // MARK: - Bypass Logic

    private func bypass(completionHandler: @escaping (ShieldActionResponse) -> Void) {
        if let defaults = UserDefaults(suiteName: appGroupID) {
            defaults.set(true, forKey: "shieldsBypassed")
            defaults.synchronize()
        }

        completionHandler(.defer)

        DispatchQueue.global(qos: .userInteractive).asyncAfter(deadline: .now() + 0.4) { [weak self] in
            self?.store.clearAllSettings()

            // Re-apply shields after a 5-minute grace period so the user
            // can't permanently bypass by never reopening LoK.
            DispatchQueue.global(qos: .background).asyncAfter(deadline: .now() + 300) {
                self?.reapplyShieldsFromSaved()
            }
        }
    }

    // MARK: - Re-apply Shields

    private func reapplyShieldsFromSaved() {
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }

        defaults.set(false, forKey: "shieldsBypassed")
        defaults.synchronize()

        if #available(iOS 16.0, *) {
            guard let data = defaults.data(forKey: selectedAppsKey),
                  let selection = try? JSONDecoder().decode(
                    FamilyActivitySelection.self, from: data
                  ) else { return }

            store.shield.applications = selection.applicationTokens.isEmpty
                ? nil : selection.applicationTokens

            store.shield.applicationCategories = selection.categoryTokens.isEmpty
                ? nil : .specific(selection.categoryTokens)

            store.shield.webDomains = selection.webDomainTokens.isEmpty
                ? nil : selection.webDomainTokens
        }
    }
}

//
//  ShieldActionExtension.swift
//  ShieldAction
//
//  Created by Ishaan Bahl on 2026-03-01.
//

import Foundation
import ManagedSettings

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
        // 1. Set bypass flag FIRST — so ShieldConfigurationExtension
        //    returns a blank dark screen when iOS re-queries it
        if let defaults = UserDefaults(suiteName: appGroupID) {
            defaults.set(true, forKey: "shieldsBypassed")
            defaults.synchronize()
        }

        // 2. Defer FIRST — iOS re-queries ShieldConfigurationExtension,
        //    which sees the bypass flag and returns an opaque black config.
        //    This must happen BEFORE clearing shields so iOS actually
        //    calls our extension instead of showing its default UI.
        completionHandler(.defer)

        // 3. After a brief delay (giving iOS time to render our dark config),
        //    clear shields so the overlay dismisses entirely.
        DispatchQueue.global(qos: .userInteractive).asyncAfter(deadline: .now() + 0.4) { [weak self] in
            self?.store.clearAllSettings()
        }
    }
}

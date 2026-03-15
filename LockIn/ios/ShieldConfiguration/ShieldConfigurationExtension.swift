//
//  ShieldConfigurationExtension.swift
//  ShieldConfiguration
//
//  Created by Ishaan Bahl on 2026-03-01.
//

import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    private let appGroupID = "group.com.ishaanbahl.lockin"

    /// Check if the user tapped "Continue Anyway"
    private var isBypassed: Bool {
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return false }
        return defaults.bool(forKey: "shieldsBypassed")
    }

    // MARK: - App Shield

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        if isBypassed {
            return bypassConfig()
        }
        return activeConfig(subtitle: "Finish your tasks before using this app.")
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    // MARK: - Web Shield

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        if isBypassed {
            return bypassConfig()
        }
        return activeConfig(subtitle: "Finish your tasks before browsing.")
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }

    // MARK: - Configs

    /// Normal shield — shown when tasks are incomplete
    private func activeConfig(subtitle: String) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: .black,
            title: ShieldConfiguration.Label(
                text: "Lock In First",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: .gray
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "OK",
                color: .white
            ),
            primaryButtonBackgroundColor: .purple,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Continue Anyway",
                color: .gray
            )
        )
    }

    /// Bypass shield — fully opaque black screen (no blur) so the
    /// brief .defer re-evaluation looks like a smooth dark transition
    /// instead of flashing the white default Apple "Restricted" UI.
    private func bypassConfig() -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundColor: .black,
            title: ShieldConfiguration.Label(
                text: " ",
                color: .clear
            ),
            subtitle: ShieldConfiguration.Label(
                text: " ",
                color: .clear
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: " ",
                color: .clear
            ),
            primaryButtonBackgroundColor: .clear,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: " ",
                color: .clear
            )
        )
    }
}

//
//  ShieldConfigurationExtension.swift
//  ShieldConfiguration
//
//  Created by Ishaan Bahl on 2026-03-01.
//

import ManagedSettings
import ManagedSettingsUI
import UIKit

// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.
class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: .black,
            title: ShieldConfiguration.Label(
                text: "Lock In First",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Finish your tasks before using this app.",
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

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: .black,
            title: ShieldConfiguration.Label(
                text: "Lock In First",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Finish your tasks before browsing.",
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

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }
}

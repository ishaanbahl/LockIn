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
        return activeConfig(subtitle: "Complete all tasks to remove this blocker.")
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

    private func resizedImage(_ image: UIImage, to size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }

    private func activeConfig(subtitle: String) -> ShieldConfiguration {
        let greenBg = UIColor(red: 8.0/255.0, green: 84.0/255.0, blue: 47.0/255.0, alpha: 1.0)
        let orangeBtn = UIColor(red: 255.0/255.0, green: 149.0/255.0, blue: 0.0/255.0, alpha: 1.0)

        var mascotIcon: UIImage? = nil
        if let raw = UIImage(named: "LokMascot", in: Bundle(for: type(of: self)), compatibleWith: nil) {
            mascotIcon = resizedImage(raw, to: CGSize(width: 128, height: 128))
        }

        return ShieldConfiguration(
            backgroundColor: greenBg,
            icon: mascotIcon,
            title: ShieldConfiguration.Label(
                text: "Blocked by Lok",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: UIColor(white: 0.85, alpha: 1.0)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Go back",
                color: .white
            ),
            primaryButtonBackgroundColor: orangeBtn,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "5 Min Scroll →",
                color: UIColor(white: 0.7, alpha: 1.0)
            )
        )
    }

    private func bypassConfig() -> ShieldConfiguration {
        let greenBg = UIColor(red: 8.0/255.0, green: 84.0/255.0, blue: 47.0/255.0, alpha: 1.0)

        return ShieldConfiguration(
            backgroundColor: greenBg,
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

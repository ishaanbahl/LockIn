import ExpoModulesCore
import FamilyControls
import ManagedSettings
import DeviceActivity
import SwiftUI

/// Expo native module bridging iOS Screen Time APIs to React Native.
///
/// Uses:
/// - FamilyControls: Authorization
/// - ManagedSettings: Blocking/unblocking apps via shield
/// - FamilyActivityPicker: Apple's built-in app selection UI
///
/// The selected apps are persisted in UserDefaults (within the App Group)
/// so the Shield Configuration Extension can access them.
public class ScreenTimeExpoModule: Module {

    // ManagedSettings store — controls which apps are shielded
    private let store = ManagedSettingsStore()

    // App Group identifier — must match your App Group entitlement
    private let appGroupID = "group.com.ishaanbahl.lockin"

    // UserDefaults key for storing the selected app tokens
    private let selectedAppsKey = "selectedFamilyActivitySelection"

    public func definition() -> ModuleDefinition {
        Name("ScreenTimeExpoModule")

        // MARK: - Request Authorization
        AsyncFunction("requestAuthorization") { () -> Bool in
            if #available(iOS 16.0, *) {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    return AuthorizationCenter.shared.authorizationStatus == .approved
                } catch {
                    print("[ScreenTime] Authorization error: \(error)")
                    return false
                }
            } else {
                print("[ScreenTime] Requires iOS 16+")
                return false
            }
        }

        // MARK: - Check Authorization Status
        AsyncFunction("isAuthorized") { () -> Bool in
            if #available(iOS 16.0, *) {
                return AuthorizationCenter.shared.authorizationStatus == .approved
            }
            return false
        }

        // MARK: - Present App Picker
        // Shows Apple's FamilyActivityPicker in a SwiftUI sheet.
        // The user selects which apps to block. Selections are saved
        // to shared UserDefaults (App Group) so the shield extension
        // can read them.
        AsyncFunction("presentAppPicker") { (promise: Promise) in
            if #available(iOS 16.0, *) {
                DispatchQueue.main.async {
                    let pickerVC = AppPickerHostingController(
                        appGroupID: self.appGroupID,
                        selectedAppsKey: self.selectedAppsKey
                    ) { didSelect in
                        promise.resolve(didSelect)
                    }

                    if let rootVC = self.getTopViewController() {
                        rootVC.present(pickerVC, animated: true)
                    } else {
                        promise.resolve(false)
                    }
                }
            } else {
                promise.resolve(false)
            }
        }

        // MARK: - Block Selected Apps
        // Reads the saved app selection from UserDefaults and applies
        // a shield to those apps via ManagedSettingsStore.
        AsyncFunction("blockSelectedApps") { () -> Bool in
            if #available(iOS 16.0, *) {
                guard let selection = self.loadSelection() else {
                    print("[ScreenTime] No apps selected to block")
                    return false
                }

                // Apply shield to selected apps
                self.store.shield.applications = selection.applicationTokens.isEmpty
                    ? nil
                    : selection.applicationTokens

                // Also shield selected categories
                self.store.shield.applicationCategories = selection.categoryTokens.isEmpty
                    ? nil
                    : .specific(selection.categoryTokens)

                // Shield web domains too
                self.store.shield.webDomains = selection.webDomainTokens.isEmpty
                    ? nil
                    : selection.webDomainTokens

                print("[ScreenTime] Blocked \(selection.applicationTokens.count) apps, \(selection.categoryTokens.count) categories")
                return true
            }
            return false
        }

        // MARK: - Unblock All Apps
        // Clears all shields from ManagedSettingsStore.
        AsyncFunction("unblockAllApps") { () -> Bool in
            self.store.shield.applications = nil
            self.store.shield.applicationCategories = nil
            self.store.shield.webDomains = nil
            print("[ScreenTime] All apps unblocked")
            return true
        }

        // MARK: - Get Blocked App Count
        AsyncFunction("getBlockedAppCount") { () -> Int in
            if #available(iOS 16.0, *) {
                guard let selection = self.loadSelection() else { return 0 }
                return selection.applicationTokens.count + selection.categoryTokens.count
            }
            return 0
        }

        // MARK: - Re-apply Shields If Bypassed
        // Checks if the Shield Action extension bypassed the shields,
        // and re-applies them if so. Call this when the app becomes active.
        AsyncFunction("reapplyShieldsIfNeeded") { () -> Bool in
            if #available(iOS 16.0, *) {
                guard let defaults = UserDefaults(suiteName: self.appGroupID) else { return false }

                if defaults.bool(forKey: "shieldsBypassed") {
                    // Clear the flag
                    defaults.set(false, forKey: "shieldsBypassed")

                    // Re-apply shields
                    guard let selection = self.loadSelection() else { return false }

                    self.store.shield.applications = selection.applicationTokens.isEmpty
                        ? nil
                        : selection.applicationTokens

                    self.store.shield.applicationCategories = selection.categoryTokens.isEmpty
                        ? nil
                        : .specific(selection.categoryTokens)

                    self.store.shield.webDomains = selection.webDomainTokens.isEmpty
                        ? nil
                        : selection.webDomainTokens

                    print("[ScreenTime] Shields re-applied after bypass")
                    return true
                }
            }
            return false
        }
    }

    // MARK: - Helpers

    /// Load the saved FamilyActivitySelection from App Group UserDefaults
    @available(iOS 16.0, *)
    private func loadSelection() -> FamilyActivitySelection? {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let data = defaults.data(forKey: selectedAppsKey) else {
            return nil
        }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    /// Get the topmost view controller to present the picker
    private func getTopViewController() -> UIViewController? {
        guard let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first,
              let rootVC = windowScene.windows.first?.rootViewController else {
            return nil
        }

        var topVC = rootVC
        while let presented = topVC.presentedViewController {
            topVC = presented
        }
        return topVC
    }
}


// MARK: - FamilyActivityPicker SwiftUI Wrapper

/// A UIHostingController that wraps Apple's FamilyActivityPicker in SwiftUI.
/// When the user selects apps and taps Done, the selection is saved to
/// shared UserDefaults.
@available(iOS 16.0, *)
class AppPickerHostingController: UIHostingController<AppPickerView> {
    init(appGroupID: String, selectedAppsKey: String, completion: @escaping (Bool) -> Void) {
        let viewModel = AppPickerViewModel(
            appGroupID: appGroupID,
            selectedAppsKey: selectedAppsKey
        )

        let view = AppPickerView(
            viewModel: viewModel,
            onDismiss: { didSelect in
                completion(didSelect)
            }
        )

        super.init(rootView: view)
        self.modalPresentationStyle = .pageSheet
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) not implemented")
    }
}

@available(iOS 16.0, *)
class AppPickerViewModel: ObservableObject {
    @Published var selection = FamilyActivitySelection()
    let appGroupID: String
    let selectedAppsKey: String

    init(appGroupID: String, selectedAppsKey: String) {
        self.appGroupID = appGroupID
        self.selectedAppsKey = selectedAppsKey

        // Load existing selection
        if let defaults = UserDefaults(suiteName: appGroupID),
           let data = defaults.data(forKey: selectedAppsKey),
           let saved = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            self.selection = saved
        }
    }

    func save() {
        guard let defaults = UserDefaults(suiteName: appGroupID) else { return }
        if let data = try? JSONEncoder().encode(selection) {
            defaults.set(data, forKey: selectedAppsKey)
            print("[ScreenTime] Saved selection: \(selection.applicationTokens.count) apps, \(selection.categoryTokens.count) categories")
        }
    }
}

@available(iOS 16.0, *)
struct AppPickerView: View {
    @ObservedObject var viewModel: AppPickerViewModel
    let onDismiss: (Bool) -> Void

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $viewModel.selection)
                .navigationTitle("Block These Apps")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            // Dismiss without saving
                            if let vc = getHostingController() {
                                vc.dismiss(animated: true) {
                                    self.onDismiss(false)
                                }
                            }
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            viewModel.save()
                            if let vc = getHostingController() {
                                vc.dismiss(animated: true) {
                                    self.onDismiss(true)
                                }
                            }
                        }
                        .fontWeight(.bold)
                    }
                }
        }
    }

    private func getHostingController() -> UIViewController? {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows.first?.rootViewController?.presentedViewController
    }
}

/**
 * Expo Config Plugin: withScreenTime
 *
 * Automatically configures the iOS project for Screen Time APIs:
 *
 * 1. Adds the FamilyControls entitlement
 * 2. Adds App Group entitlement (for sharing data with extensions)
 * 3. Sets the minimum iOS version to 16.0+
 * 4. Adds the URL scheme for deep linking from the shield
 *
 * MANUAL STEPS STILL REQUIRED after `expo prebuild`:
 * - Add Shield Configuration Extension target in Xcode
 * - Add Device Activity Monitor Extension target in Xcode
 * - Add both extension targets to the same App Group
 * - Copy Swift files from ios-extensions/ into the new targets
 *
 * See README or PRODUCT_SPEC.md for detailed instructions.
 */

const {
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} = require("@expo/config-plugins");

const APP_GROUP_ID = "group.com.ishaanbahl.lockin";

/**
 * Add FamilyControls + App Group entitlements
 */
function withScreenTimeEntitlements(config) {
  return withEntitlementsPlist(config, (mod) => {
    // FamilyControls entitlement (required for Screen Time API)
    mod.modResults["com.apple.developer.family-controls"] = true;

    // App Groups (shared storage between app and extensions)
    mod.modResults["com.apple.security.application-groups"] = [APP_GROUP_ID];

    return mod;
  });
}

/**
 * Add URL scheme for deep linking from shield "Open LockIn" button
 */
function withScreenTimeInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    // Ensure URL schemes include our app scheme
    const urlTypes = mod.modResults.CFBundleURLTypes || [];
    const hasScheme = urlTypes.some(
      (t) => t.CFBundleURLSchemes && t.CFBundleURLSchemes.includes("lockin")
    );

    if (!hasScheme) {
      urlTypes.push({
        CFBundleURLSchemes: ["lockin"],
        CFBundleURLName: "com.ishaanbahl.lockin",
      });
    }

    mod.modResults.CFBundleURLTypes = urlTypes;

    return mod;
  });
}

/**
 * Set deployment target to iOS 16.0 (required for Screen Time APIs)
 */
function withiOS16DeploymentTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key in configurations) {
      const config = configurations[key];
      if (config.buildSettings) {
        config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "16.0";
      }
    }

    return mod;
  });
}

/**
 * Main plugin — composes all modifications
 */
function withScreenTime(config) {
  config = withScreenTimeEntitlements(config);
  config = withScreenTimeInfoPlist(config);
  config = withiOS16DeploymentTarget(config);
  return config;
}

module.exports = withScreenTime;

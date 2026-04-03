import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { screenTimeService } from "../../services/screenTime";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { StepIndicator } from "../../components/StepIndicator";

export default function PermissionsScreen() {
  const [screenTimeGranted, setScreenTimeGranted] = useState(false);

  // Check if already granted on mount
  React.useEffect(() => {
    screenTimeService.isAuthorized().then(setScreenTimeGranted);
  }, []);

  const handleScreenTime = async () => {
    // Request permission
    const requested = await screenTimeService.requestAuthorization();
    
    // Even if requested returns false, re-verify status (handles "already authorized" or race conditions)
    const trulyGranted = await screenTimeService.isAuthorized();
    const finalGranted = requested || trulyGranted;
    
    setScreenTimeGranted(finalGranted);

    if (!finalGranted) {
      Alert.alert(
        "Screen Time Access",
        "Without Screen Time access, Lok can't block distracting apps. You can enable this later in Settings.",
        [{ text: "OK" }]
      );
    }
  };

  const handleContinue = () => {
    router.push("/(onboarding)/pick-apps");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          Lok needs a couple of permissions to work its magic.
        </Text>
      </View>

      <View style={styles.middleSection}>
        <StepIndicator totalSteps={3} currentStep={0} />

        <View style={styles.cardArea}>
          <PermissionCard
            title="Screen Time Access"
            description="Lets Lok block distracting apps until your tasks are done"
            granted={screenTimeGranted}
            onPress={handleScreenTime}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !screenTimeGranted && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!screenTimeGranted}
        >
          <Text style={styles.buttonText}>Continue  →</Text>
        </TouchableOpacity>

        {!screenTimeGranted && (
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function PermissionCard({
  title,
  description,
  granted,
  onPress,
}: {
  title: string;
  description: string;
  granted: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, granted && styles.cardGranted]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={granted}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <Text style={styles.cardStatus}>
        {granted ? "✅ Granted" : "Tap to enable"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  topSection: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: "600",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    fontFamily: "Didot",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  middleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardArea: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  cardGranted: {
    borderColor: Colors.success,
    backgroundColor: "#00B89410",
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  cardDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  cardStatus: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    gap: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    alignSelf: "stretch",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

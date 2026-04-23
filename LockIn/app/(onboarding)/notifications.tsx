import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { requestNotificationPermissions } from "../../services/notifications";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { StepIndicator } from "../../components/StepIndicator";

export default function NotificationsOnboardingScreen() {
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  // Check current status on mount — if user already granted, skip the prompt flow
  React.useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsGranted(status === "granted");
    });
  }, []);

  const handleRequest = async () => {
    const granted = await requestNotificationPermissions();
    setNotificationsGranted(granted);

    if (!granted) {
      Alert.alert(
        "Notifications",
        "Without notifications, Lok can't remind you about tasks or send your morning summary. You can enable them later in Settings.",
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
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Lok sends a morning summary and reminders before tasks are due.
        </Text>
      </View>

      <View style={styles.middleSection}>
        <StepIndicator totalSteps={4} currentStep={1} />

        <View style={styles.cardArea}>
          <TouchableOpacity
            style={[styles.card, notificationsGranted && styles.cardGranted]}
            onPress={handleRequest}
            activeOpacity={0.7}
            disabled={notificationsGranted}
          >
            <Text style={styles.cardTitle}>Allow Notifications</Text>
            <Text style={styles.cardDescription}>
              Lok will send you reminders before your tasks are due.
            </Text>
            <Text style={styles.cardStatus}>
              {notificationsGranted ? "✅ Granted" : "Tap to enable"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !notificationsGranted && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!notificationsGranted}
        >
          <Text style={styles.buttonText}>Continue  →</Text>
        </TouchableOpacity>

        {!notificationsGranted && (
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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

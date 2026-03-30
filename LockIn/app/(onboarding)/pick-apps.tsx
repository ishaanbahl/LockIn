import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { screenTimeService } from "../../services/screenTime";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { StepIndicator } from "../../components/StepIndicator";

export default function PickAppsScreen() {
  const [hasSelected, setHasSelected] = useState(false);

  const handlePickApps = async () => {
    try {
      await screenTimeService.presentAppPicker();
      const count = await screenTimeService.getBlockedAppCount();
      setHasSelected(count > 0);
    } catch {
      // User cancelled or not available
    }
  };

  const handleContinue = () => {
    router.push("/(onboarding)/first-tasks");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Block Apps</Text>
        <Text style={styles.subtitle}>
          Which apps distract you the most? Lok will block them until your
          tasks are done.
        </Text>
      </View>

      <View style={styles.middleSection}>
        <StepIndicator totalSteps={3} currentStep={1} />

        <View style={styles.cardArea}>
          <TouchableOpacity
          style={styles.pickerButton}
          onPress={handlePickApps}
          activeOpacity={0.7}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>
              {hasSelected ? "Change selected apps" : "Choose apps to block"}
            </Text>
            <Text style={styles.pickerSubtitle}>
              {hasSelected
                ? "✅ Apps selected — they'll be blocked when you have tasks"
                : "Instagram, TikTok, YouTube, X, Reddit..."}
            </Text>
          </View>
          <Text style={styles.pickerArrow}>›</Text>
        </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 How it works</Text>
            <Text style={styles.infoText}>
              When you have unchecked tasks, 
              opening a blocked app will remind you about your task list. 
              You can still choose to continue, it's a nudge,
              not a prison.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue  →</Text>
        </TouchableOpacity>
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
  middleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardArea: {
    flex: 1,
    gap: Spacing.md,
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
    lineHeight: 22,
  },
  pickerButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  pickerEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  pickerContent: {
    flex: 1,
  },
  pickerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  pickerSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  pickerArrow: {
    color: Colors.textMuted,
    fontSize: FontSize.xl,
    fontWeight: "300",
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  footer: {
    gap: Spacing.md,
    alignItems: "center",
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

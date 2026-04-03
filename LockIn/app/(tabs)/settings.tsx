import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking,
} from "react-native";
import { useTaskStore } from "../../store/taskStore";
import { useAppStore } from "../../store/appStore";
import { screenTimeService } from "../../services/screenTime";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";

export default function SettingsScreen() {
  const clearCompleted = useTaskStore((s) => s.clearCompleted);
  const clearClearableTasks = useTaskStore((s) => s.clearClearableTasks);
  const isDailyResetEnabled = useAppStore((s) => s.isDailyResetEnabled);
  const setDailyReset = useAppStore((s) => s.setDailyReset);
  const displayName = useAppStore((s) => s.displayName);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);

  const handleScreenTimeAuth = async () => {
    const granted = await screenTimeService.requestAuthorization();
    Alert.alert(
      granted ? "Authorized ✅" : "Not Authorized",
      granted
        ? "Screen Time access granted. You can now block apps."
        : "Screen Time access is required to block apps. Please enable it in Settings."
    );
  };

  const handlePickApps = async () => {
    await screenTimeService.presentAppPicker();
  };

  const handleChangeName = () => {
    Alert.prompt(
      "Change Display Name",
      "Enter the name you'd like to be called:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (name?: string) => {
            if (name?.trim()) setDisplayName(name.trim());
          }
        },
      ],
      "plain-text",
      displayName
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <Text style={styles.sectionTitle}>Profile</Text>
      <SettingsButton
        title="Display Name"
        subtitle={`Current: ${displayName}`}
        onPress={handleChangeName}
      />

      {/* Screen Time Section */}
      <Text style={styles.sectionTitle}>App Blocking</Text>

      <SettingsButton
        title="Grant Screen Time Access"
        subtitle="Required to block distracting apps"
        onPress={handleScreenTimeAuth}
      />
      <SettingsButton
        title="Choose Apps to Block"
        subtitle="Pick which apps to restrict until tasks are done"
        onPress={handlePickApps}
      />

      {/* Tasks Section */}
      <Text style={styles.sectionTitle}>Tasks</Text>

      <View style={styles.toggleRow}>
        <View style={styles.toggleContent}>
          <Text style={styles.buttonTitle}>Daily Reset</Text>
          <Text style={styles.buttonSubtitle}>
            Auto-clear completed tasks at midnight
          </Text>
        </View>
        <Switch
          value={isDailyResetEnabled}
          onValueChange={setDailyReset}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.textPrimary}
        />
      </View>

      <SettingsButton
        title="Clear Completed Tasks"
        subtitle="Remove all checked-off tasks"
        onPress={() =>
          Alert.alert(
            "Clear Completed?",
            "This will remove all completed tasks.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearCompleted },
            ]
          )
        }
        destructive
      />

      <SettingsButton
        title="Clear Removable Tasks"
        subtitle="Remove all tasks marked as clearable"
        onPress={() =>
          Alert.alert(
            "Clear Removable Tasks?",
            "This will remove all tasks marked as clearable.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearClearableTasks },
            ]
          )
        }
        destructive
      />

      {/* Support */}
      <Text style={styles.sectionTitle}>Support</Text>
      <SettingsButton
        title="Contact Developer"
        subtitle="Report bugs, request features, or say hi"
        onPress={() => Linking.openURL("mailto:ishaanbahl6200@gmail.com?subject=Lok%20App%20Feedback")}
      />
      <SettingsButton
        title="Reset Onboarding"
        subtitle="For testing: go back to the welcome screens"
        onPress={() => {
          Alert.alert(
            "Reset Onboarding?",
            "This will take you back to the welcome screen. Your tasks will not be deleted.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: resetOnboarding },
            ]
          );
        }}
        destructive
      />

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutName}>Lok</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutTagline}>Productivity app without the fluff.</Text>
      </View>
    </ScrollView>
  );
}

function SettingsButton({
  title,
  subtitle,
  onPress,
  destructive = false,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonTitle, destructive && styles.destructiveText]}>
        {title}
      </Text>
      <Text style={styles.buttonSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  buttonTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  buttonSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  destructiveText: {
    color: Colors.danger,
  },
  toggleRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
  },
  aboutName: {
    color: Colors.primary,
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  aboutVersion: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  aboutTagline: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },
});

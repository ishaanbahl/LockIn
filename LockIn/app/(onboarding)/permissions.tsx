import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { screenTimeService } from "../../services/screenTime";
import { requestNotificationPermissions } from "../../services/notifications";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";

export default function PermissionsScreen() {
  const [screenTimeGranted, setScreenTimeGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const handleScreenTime = async () => {
    const granted = await screenTimeService.requestAuthorization();
    setScreenTimeGranted(granted);
    if (!granted) {
      Alert.alert(
        "Screen Time Access",
        "Without Screen Time access, LockIn can't block distracting apps. You can enable this later in Settings."
      );
    }
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotificationsGranted(granted);
    if (!granted) {
      Alert.alert(
        "Notifications",
        "Without notifications, LockIn can't remind you about incomplete tasks. You can enable this later in Settings."
      );
    }
  };

  const handleContinue = () => {
    router.push("/(onboarding)/pick-apps");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          LockIn needs a couple of permissions to work its magic.
        </Text>

        <View style={styles.permissions}>
          <PermissionCard
            emoji="📵"
            title="Screen Time Access"
            description="Lets LockIn block distracting apps until your tasks are done"
            granted={screenTimeGranted}
            onPress={handleScreenTime}
          />

          <PermissionCard
            emoji="🔔"
            title="Notifications"
            description="Reminds you when you have incomplete tasks"
            granted={notificationsGranted}
            onPress={handleNotifications}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.7}>
          <Text style={styles.skipText}>
            {screenTimeGranted || notificationsGranted
              ? ""
              : "Skip for now"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PermissionCard({
  emoji,
  title,
  description,
  granted,
  onPress,
}: {
  emoji: string;
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
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
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
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
  },
  content: {},
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
  },
  permissions: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardGranted: {
    borderColor: Colors.success,
    backgroundColor: "#00B89410",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDescription: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  cardStatus: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
    textAlign: "right",
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
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

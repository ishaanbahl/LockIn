import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>LockIn</Text>
        <Text style={styles.subtitle}>
          Finish your tasks before you scroll.
        </Text>

        <View style={styles.features}>
          <FeatureRow emoji="📝" text="Add your daily tasks" />
          <FeatureRow emoji="📵" text="Distracting apps get blocked" />
          <FeatureRow emoji="✅" text="Check everything off to unlock" />
          <FeatureRow emoji="🎉" text="Scroll guilt-free" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(onboarding)/permissions")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: Spacing.xxl,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.primary,
    fontSize: FontSize.hero,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    textAlign: "center",
    marginBottom: Spacing.xxl,
    fontStyle: "italic",
  },
  features: {
    alignSelf: "stretch",
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

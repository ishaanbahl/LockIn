import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const FEATURES = [
  {
    icon: "checkmark-circle-outline" as const,
    title: "Task Management",
    description:
      "Create, organize, and check off tasks. Drag to reorder and indent for sub-tasks.",
  },
  {
    icon: "time-outline" as const,
    title: "Due Times",
    description:
      "Set due times on tasks and get notified before your deadlines.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "App Blocking",
    description:
      "Block distracting apps using Screen Time until your tasks are completed.",
  },
  {
    icon: "trash-outline" as const,
    title: "Removable Tasks",
    description:
      "Mark tasks as removable to bulk clear them from Settings when you no longer need them.",
  },
  {
    icon: "refresh-outline" as const,
    title: "Daily Reset",
    description:
      "Automatically clear completed tasks at midnight so you start each day fresh.",
  },
  {
    icon: "color-palette-outline" as const,
    title: "Task Colors",
    description:
      "Color-code your tasks to visually organize and prioritize your day.",
  },
];

export default function FeaturesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Features</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Everything Lok can do for you.
        </Text>

        {FEATURES.map((feature, idx) => (
          <View key={idx} style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={feature.icon}
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  intro: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});

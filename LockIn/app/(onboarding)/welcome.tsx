import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { Spacing, FontSize, BorderRadius } from "../../constants/theme";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/lok-mascot.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.title}>Lok.</Text>
        </View>
        <Text style={styles.subtitle}>Work first. Scroll Later.</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(onboarding)/permissions")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    justifyContent: "space-between",
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  mascot: {
    width: 120,
    height: 120,
    marginRight: Spacing.md,
  },
  title: {
    color: "#08542f",
    fontSize: 72,
    fontWeight: "800",
    fontFamily: "Didot",
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: FontSize.xs,
    textAlign: "center",
  },
  featureText: {
    color: "#08542f",
    fontSize: FontSize.md,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#08542f",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});

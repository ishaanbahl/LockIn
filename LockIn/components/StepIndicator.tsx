import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Spacing } from "../constants/theme";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isLast = i === totalSteps - 1;

        return (
          <View key={i} style={styles.stepGroup}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
                isCurrent && styles.circleCurrent,
              ]}
            />
            {!isLast && (
              <View
                style={[
                  styles.line,
                  isCompleted && styles.lineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  stepGroup: {
    alignItems: "center",
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.border,
  },
  circleCompleted: {
    backgroundColor: Colors.primary,
  },
  circleCurrent: {
    backgroundColor: Colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  line: {
    width: 3,
    height: 100,
    backgroundColor: Colors.border,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
});

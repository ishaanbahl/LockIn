import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTaskStore } from "../../store/taskStore";
import { useAppStore } from "../../store/appStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { StepIndicator } from "../../components/StepIndicator";

export default function FirstTasksScreen() {
  const [tasks, setTasks] = useState(["", "", ""]);
  const [name, setName] = useState("");
  const addTask = useTaskStore((s) => s.addTask);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setDisplayName = useAppStore((s) => s.setDisplayName);

  const updateTask = (index: number, value: string) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
  };

  const addMoreSlot = () => {
    setTasks([...tasks, ""]);
  };

  const handleFinish = () => {
    if (name.trim()) setDisplayName(name.trim());
    const validTasks = tasks.filter((t) => t.trim().length > 0);
    validTasks.forEach((title) => addTask(title.trim()));
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const filledCount = tasks.filter((t) => t.trim().length > 0).length;
  const canFinish = filledCount > 0 && name.trim().length > 0;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.middleRow}>
        <View style={styles.stepColumn}>
          <StepIndicator totalSteps={3} currentStep={2} />
        </View>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>What's your name?</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            returnKeyType="next"

          />

          <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Your tasks</Text>
          <Text style={styles.subtitle}>
            Add a few tasks to get started.
          </Text>

          <View style={styles.taskInputs}>
            {tasks.map((task, index) => (
              <View key={index} style={styles.inputRow}>
                <View style={styles.inputCheckbox}>
                  <Text style={styles.inputNumber}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={
                    index === 0
                      ? "e.g. Finish homework"
                      : index === 1
                      ? "e.g. Go to the gym"
                      : index === 2
                      ? "e.g. Read 20 pages"
                      : "Another task..."
                  }
                  placeholderTextColor={Colors.textMuted}
                  value={task}
                  onChangeText={(v) => updateTask(index, v)}
                  returnKeyType="next"
                />
              </View>
            ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canFinish && styles.buttonDisabled]}
          onPress={handleFinish}
          activeOpacity={0.8}
          disabled={!canFinish}
        >
          <Text style={styles.buttonText}>
            {!name.trim()
              ? "Enter your name to continue"
              : filledCount === 0
              ? "Add at least 1 task"
              : `Lock In with ${filledCount} task${filledCount === 1 ? "" : "s"}  →`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },
  topSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: "600",
  },
  middleRow: {
    flex: 1,
    flexDirection: "row",
  },
  stepColumn: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: Spacing.md,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    fontFamily: "Didot",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  nameInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  taskInputs: {
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  inputCheckbox: {
    width: 44,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceLight,
  },
  inputNumber: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    padding: Spacing.md,
  },
  addMore: {
    padding: Spacing.md,
    alignItems: "center",
  },
  addMoreText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
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

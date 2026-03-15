import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/task";
import { TaskItem } from "../../components/TaskItem";
import { AddTaskSheet } from "../../components/AddTaskSheet";
import { EmptyState } from "../../components/EmptyState";
import { screenTimeService } from "../../services/screenTime";
import { syncTasksToSharedStorage, clearSharedStorage } from "../../services/sharedStorage";
import { scheduleTaskReminder, sendCompletionNotification } from "../../services/notifications";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Checkbox } from "../../components/Checkbox";

export default function TaskListScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const insets = useSafeAreaInsets();

  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const allDone = tasks.length > 0 && incompleteTasks.length === 0;

  useEffect(() => {
    if (!isLoaded) return;

    syncTasksToSharedStorage(tasks);

    if (allDone) {
      screenTimeService.unblockAllApps();
      clearSharedStorage();
      sendCompletionNotification();
    } else if (incompleteTasks.length > 0) {
      screenTimeService.blockApps();
      scheduleTaskReminder(incompleteTasks.length);
    }
  }, [allDone, incompleteTasks.length, isLoaded]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskItem
      task={item}
      onToggle={() => toggleTask(item.id)}
      onDelete={() => deleteTask(item.id)}
      drag={drag}
      isActive={isActive}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Hello, Ishaan!</Text>
      <Text style={styles.headerSubtitle}>Here are your daily to-do's:</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.inlineAddContainer}>
      <View style={styles.inlineAddCheckboxMock}>
        {/* Just a visual mock of a checkbox for the input line */}
        <View style={styles.mockCheckboxBox} />
      </View>
      <TextInput
        style={styles.inlineAddInput}
        placeholder="add another item..."
        placeholderTextColor={Colors.textMuted}
        value={newTaskTitle}
        onChangeText={setNewTaskTitle}
        onSubmitEditing={handleAddTask}
        returnKeyType="done"
      />
    </View>
  );

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyState />}
        onDragEnd={({ data }) => reorderTasks(data)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        activationDistance={15}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddSheet(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTaskSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={(title, dueTime) => addTask(title, dueTime)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginTop: 4,
    fontWeight: "400",
  },
  list: {
    paddingBottom: 100,
  },
  inlineAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  inlineAddCheckboxMock: {
    paddingRight: Spacing.sm,
  },
  mockCheckboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.textMuted, // Gray border for new item
    borderRadius: 4,
  },
  inlineAddInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary, // Black
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Subtle shadow on light bg
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: Colors.surface, // White text on black
    fontSize: FontSize.xxl,
    fontWeight: "300",
    marginTop: -2,
  },
});

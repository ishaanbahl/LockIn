import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/task";
import { TaskItem } from "../../components/TaskItem";
import { AddTaskSheet } from "../../components/AddTaskSheet";
import { TaskStatusBar } from "../../components/StatusBar";
import { EmptyState } from "../../components/EmptyState";
import { screenTimeService } from "../../services/screenTime";
import { syncTasksToSharedStorage, clearSharedStorage } from "../../services/sharedStorage";
import { scheduleTaskReminder, sendCompletionNotification } from "../../services/notifications";
import { Colors, Spacing, FontSize } from "../../constants/theme";

export default function TaskListScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);

  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const allDone = tasks.length > 0 && incompleteTasks.length === 0;

  // React to task state changes → block/unblock apps + update reminders + sync to shield
  useEffect(() => {
    if (!isLoaded) return;

    // Sync incomplete tasks to shared storage for the shield extension
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskItem
      task={item}
      onToggle={() => toggleTask(item.id)}
      onDelete={() => deleteTask(item.id)}
      drag={drag}
      isActive={isActive}
    />
  );

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <TaskStatusBar
        incompleteCount={incompleteTasks.length}
        totalCount={tasks.length}
      />

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <DraggableFlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorderTasks(data)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          activationDistance={15}
        />
      )}

      {/* Floating add button */}
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
    padding: Spacing.md,
  },
  list: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: "300",
    marginTop: -2,
  },
});

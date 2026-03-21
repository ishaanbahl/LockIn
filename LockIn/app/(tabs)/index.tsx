import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  Keyboard,
  Pressable,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/task";
import { TaskItem } from "../../components/TaskItem";
import { AddTaskSheet } from "../../components/AddTaskSheet";
import { EditTimeSheet } from "../../components/EditTimeSheet";
import { ColorToolbar } from "../../components/ColorToolbar";
import { EmptyState } from "../../components/EmptyState";
import { screenTimeService } from "../../services/screenTime";
import { syncTasksToSharedStorage, clearSharedStorage } from "../../services/sharedStorage";
import { scheduleTaskReminder, sendCompletionNotification } from "../../services/notifications";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../store/appStore";

import { Confetti } from "../../components/Confetti";

export default function TaskListScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showEditTimeSheet, setShowEditTimeSheet] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [quickAddColor, setQuickAddColor] = useState<string>(Colors.taskColors.default);
  const [showConfetti, setShowConfetti] = useState(false);
  const quickAddRef = React.useRef<TextInput>(null);
  const focusTransferring = React.useRef(false);
  const insets = useSafeAreaInsets();
  
  const toolbarOpacity = React.useRef(new RNAnimated.Value(0)).current;

  // Global horizontal drag value
  const globalTranslateX = useSharedValue(0);

  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const editTask = useTaskStore((s) => s.editTask);
  const editTaskTime = useTaskStore((s) => s.editTaskTime);
  const editTaskColor = useTaskStore((s) => s.editTaskColor);
  const setSubtask = useTaskStore((s) => s.setSubtask);
  const insertTaskAfter = useTaskStore((s) => s.insertTaskAfter);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const allDone = tasks.length > 0 && incompleteTasks.length === 0;

  useEffect(() => {
    if (allDone && isLoaded) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [allDone, isLoaded]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardVisible(false);
      setFocusedTaskId(null);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    RNAnimated.timing(toolbarOpacity, {
      toValue: !!focusedTaskId ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusedTaskId]);

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
      addTask(
        newTaskTitle.trim(),
        undefined,
        quickAddColor !== Colors.taskColors.default ? quickAddColor : undefined
      );
      setNewTaskTitle("");
      setQuickAddColor(Colors.taskColors.default);
      quickAddRef.current?.focus();
    }
  };

  const currentFocusedTask = tasks.find(t => t.id === focusedTaskId);

  // Global pan gesture for horizontal movement during reordering
  const horizontalPan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (activeDragId) {
        globalTranslateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (activeDragId) {
        const threshold = 40;
        const task = tasks.find(t => t.id === activeDragId);
        if (task) {
          if (!task.isSubtask && globalTranslateX.value > threshold) {
            runOnJS(setSubtask)(task.id, true);
          } else if (task.isSubtask && globalTranslateX.value < -threshold) {
             runOnJS(setSubtask)(task.id, false);
          }
        }
      }
      globalTranslateX.value = withSpring(0);
    });

  const renderItem = React.useCallback(({ item, drag, isActive }: RenderItemParams<Task>) => (
    <TaskItem
      task={item}
      onToggle={() => toggleTask(item.id)}
      onDelete={() => deleteTask(item.id)}
      drag={drag}
      isActive={isActive}
      onEditTime={() => {
        setEditingTaskId(item.id);
        setShowEditTimeSheet(true);
      }}
      onEditTitle={(title) => editTask(item.id, title)}
      onSetSubtask={(isSubtask) => setSubtask(item.id, isSubtask)}
      onAddNext={(isSubtask) => insertTaskAfter(item.id, isSubtask, item.color)}
      onFocus={() => {
        focusTransferring.current = true;
        setFocusedTaskId(item.id);
      }}
      onBlur={() => {
        setTimeout(() => {
          if (!focusTransferring.current) setFocusedTaskId(null);
          focusTransferring.current = false;
        }, 150);
      }}
      isFocused={focusedTaskId === item.id}
      externalTranslateX={activeDragId === item.id ? globalTranslateX : undefined}
    />
  ), [tasks, focusedTaskId, activeDragId, toggleTask, deleteTask, editTask, setSubtask, insertTaskAfter]);

  const displayName = useAppStore((s) => s.displayName);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Hello, {displayName}!</Text>
      <Text style={styles.headerSubtitle}>
        {allDone ? "Looks like you're all done for the day!" : "Here are your daily to-do's:"}
      </Text>
    </View>
  );

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <GestureDetector gesture={horizontalPan}>
        <View style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
            <DraggableFlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={
                <View style={styles.inlineAddContainer}>
                  <View style={styles.inlineAddCheckboxMock}>
                    <View style={[styles.mockCheckboxBox, { borderColor: Colors.textMuted }]} />
                  </View>
                  <TextInput
                    ref={quickAddRef}
                    style={[styles.inlineAddInput, { color: quickAddColor }]}
                    placeholder="add another item..."
                    placeholderTextColor={Colors.textMuted}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onFocus={() => {
                      focusTransferring.current = true;
                      setFocusedTaskId("quickadd");
                      const lastTask = tasks[tasks.length - 1];
                      setQuickAddColor(lastTask?.color ?? Colors.taskColors.default);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!focusTransferring.current) setFocusedTaskId(null);
                        focusTransferring.current = false;
                      }, 150);
                    }}
                    onSubmitEditing={handleAddTask}
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                </View>
              }
              ListEmptyComponent={<EmptyState />}
              onDragBegin={(index) => setActiveDragId(tasks[index].id)}
              onDragEnd={({ data }) => {
                setActiveDragId(null);
                reorderTasks(data);
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              activationDistance={5}
              dragItemOverflow={true}
            />
          </Pressable>
        </View>
      </GestureDetector>

      {showConfetti && <Confetti />}

      {/* FAB */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddSheet(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Color Toolbar Component */}
      <ColorToolbar 
        opacity={toolbarOpacity}
        selectedColor={focusedTaskId === "quickadd" ? quickAddColor : currentFocusedTask?.color}
        onSelectColor={(color) => {
          if (focusedTaskId === "quickadd") {
            setQuickAddColor(color);
          } else if (focusedTaskId) {
            editTaskColor(focusedTaskId, color);
          }
        }}
      />

      <AddTaskSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={(title, dueTime, color) => addTask(title, dueTime, color)}
      />

      <EditTimeSheet
        visible={showEditTimeSheet}
        initialTime={tasks.find((t) => t.id === editingTaskId)?.dueTime}
        onClose={() => {
          setShowEditTimeSheet(false);
          setEditingTaskId(null);
        }}
        onSave={(dueTime) => {
          if (editingTaskId) {
            editTaskTime(editingTaskId, dueTime);
          }
        }}
        onRemoveTime={() => {
          if (editingTaskId) {
            editTaskTime(editingTaskId, undefined);
          }
        }}
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
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "400",
  },
  list: {
    paddingBottom: 120,
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
    borderRadius: 4,
  },
  inlineAddInput: {
    flex: 1,
    fontSize: FontSize.sm,
    marginLeft: Spacing.md,
    fontWeight: "600",
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: Colors.surface,
    fontSize: FontSize.xxl,
    fontWeight: "300",
    marginTop: -2,
  },
});

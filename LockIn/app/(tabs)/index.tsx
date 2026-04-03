import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  LayoutChangeEvent,
} from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { useTaskStore } from "../../store/taskStore";
import { Task } from "../../types/task";
import { TaskItem, INDENT_STEP_PX } from "../../components/TaskItem";
import { AddTaskSheet } from "../../components/AddTaskSheet";
import { EditTimeSheet } from "../../components/EditTimeSheet";
import { EmptyState } from "../../components/EmptyState";
import { screenTimeService } from "../../services/screenTime";
import { syncTasksToSharedStorage, clearSharedStorage } from "../../services/sharedStorage";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../store/appStore";
import { Confetti } from "../../components/Confetti";

// ─── Constants ───────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 40;
const INDENT_SNAP = 50;
const MAX_INDENT = 4;

const COLOR_PALETTE = [
  Colors.taskColors.default,
  Colors.taskColors.red,
  Colors.taskColors.blue,
  Colors.taskColors.green,
  Colors.taskColors.yellow,
];

// ─── DragGhost ───────────────────────────────────────────────────────────────
type DragGhostProps = {
  task: Task;
  pageY: number;
  dragTX: SharedValue<number>;
  dragTY: SharedValue<number>;
};

function DragGhost({ task, pageY, dragTX, dragTY }: DragGhostProps) {
  const level = task.indentLevel || 0;
  const outerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragTX.value },
      { translateY: dragTY.value },
    ],
  }));

  const innerStyle = useAnimatedStyle(() => {
    const indentDelta = Math.round(dragTX.value / INDENT_SNAP);
    const newLevel = Math.max(0, Math.min(MAX_INDENT, level + indentDelta));
    return {
      paddingLeft: newLevel * INDENT_STEP_PX,
      backgroundColor: Colors.surface,
    };
  });

  return (
    <Animated.View
      style={[ghostStyles.outer, outerStyle, { top: pageY }]}
      pointerEvents="none"
    >
      <Animated.View style={[ghostStyles.inner, innerStyle]}>
        <Text
          style={[ghostStyles.text, { color: task.color || Colors.textPrimary }]}
          numberOfLines={1}
        >
          {task.title || "…"}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const ghostStyles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  inner: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});

const DROP_BAR_STYLE = {
  height: 2,
  backgroundColor: "#007AFF",
  borderRadius: 1,
  marginVertical: 1,
} as const;

type TaskRowProps = {
  item: Task;
  idx: number;
  isFocused: boolean;
  draggingId: string | null;
  dropTargetIdx: number | null;
  dropTargetIndent: number;
  dragTX: SharedValue<number>;
  dragTY: SharedValue<number>;
  handleDragStart: (id: string, ghostTop: number) => void;
  handleDragUpdate: (tx: number, ty: number) => void;
  handleDragEnd: (tx: number, ty: number) => void;
  tasksRef: React.MutableRefObject<Task[]>;
  focusTransferring: React.MutableRefObject<boolean>;
  setFocusedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
  setIndentLevel: (id: string, level: number) => void;
  insertTaskAfter: (id: string, isSubtask?: boolean, color?: string) => void;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowEditTimeSheet: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Memoized row so `focusedTaskId` updates don't re-render every task (reduces focus "pop"). */
const TaskRow = React.memo(function TaskRow({
  item,
  idx,
  isFocused,
  draggingId,
  dropTargetIdx,
  dropTargetIndent,
  dragTX,
  dragTY,
  handleDragStart,
  handleDragUpdate,
  handleDragEnd,
  tasksRef,
  focusTransferring,
  setFocusedTaskId,
  toggleTask,
  deleteTask,
  editTask,
  setIndentLevel,
  insertTaskAfter,
  setEditingTaskId,
  setShowEditTimeSheet,
}: TaskRowProps) {
  const id = item.id;

  const onToggle = useCallback(() => toggleTask(id), [toggleTask, id]);

  const onDelete = useCallback(() => {
    const i = tasksRef.current.findIndex((t) => t.id === id);
    const prevTask = i > 0 ? tasksRef.current[i - 1] : null;
    if (prevTask) {
      focusTransferring.current = true;
      setFocusedTaskId(prevTask.id);
    }
    deleteTask(id);
  }, [id, deleteTask, tasksRef, focusTransferring, setFocusedTaskId]);

  const onEditTime = useCallback(() => {
    setEditingTaskId(id);
    setShowEditTimeSheet(true);
  }, [id, setEditingTaskId, setShowEditTimeSheet]);

  const onEditTitle = useCallback(
    (title: string) => editTask(id, title),
    [id, editTask]
  );

  const onChangeIndent = useCallback(
    (delta: number) => {
      const t = useTaskStore.getState().tasks.find((x) => x.id === id);
      const current = t?.indentLevel || 0;
      const next = Math.max(0, Math.min(MAX_INDENT, current + delta));
      if (next !== current) setIndentLevel(id, next);
    },
    [id, setIndentLevel]
  );

  const onAddNext = useCallback(() => {
    const t = useTaskStore.getState().tasks.find((x) => x.id === id);
    insertTaskAfter(id, false, t?.color);
  }, [id, insertTaskAfter]);

  const onFocus = useCallback(() => {
    focusTransferring.current = true;
    setFocusedTaskId(id);
  }, [id, focusTransferring, setFocusedTaskId]);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      if (!focusTransferring.current) setFocusedTaskId(null);
      focusTransferring.current = false;
    }, 150);
  }, [focusTransferring, setFocusedTaskId]);

  return (
    <React.Fragment>
      {draggingId && dropTargetIdx === idx && draggingId !== id && (
        <View
          style={[
            DROP_BAR_STYLE,
            { marginLeft: dropTargetIndent * INDENT_STEP_PX },
          ]}
        />
      )}
      <TaskItem
        task={item}
        onToggle={onToggle}
        onDelete={onDelete}
        onEditTime={onEditTime}
        onEditTitle={onEditTitle}
        onChangeIndent={onChangeIndent}
        onAddNext={onAddNext}
        onFocus={onFocus}
        onBlur={onBlur}
        isFocused={isFocused}
        isDragging={draggingId === id}
        dragTX={dragTX}
        dragTY={dragTY}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
      />
    </React.Fragment>
  );
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function TaskListScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showEditTimeSheet, setShowEditTimeSheet] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [quickAddColor, setQuickAddColor] = useState<string>(Colors.taskColors.default);
  const [confettiKey, setConfettiKey] = useState(0);
  const quickAddRef = useRef<TextInput>(null);
  const focusTransferring = useRef(false);
  const insets = useSafeAreaInsets();

  // ── drag state ──────────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [ghostTask, setGhostTask] = useState<Task | null>(null);
  const [ghostPageY, setGhostPageY] = useState(0);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [dropTargetIndent, setDropTargetIndent] = useState(0);
  const dragTX = useSharedValue(0);
  const dragTY = useSharedValue(0);
  const draggingIdRef = useRef<string | null>(null);
  const draggingFromIdxRef = useRef(-1);
  const tasksRef = useRef<Task[]>([]);

  // Track the Y offset of the task list within the scroll view for indicator positioning
  const [listTopOffset, setListTopOffset] = useState(0);

  // ── store ───────────────────────────────────────────────────────────────
  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const editTask = useTaskStore((s) => s.editTask);
  const editTaskTime = useTaskStore((s) => s.editTaskTime);
  const editTaskColor = useTaskStore((s) => s.editTaskColor);
  const editTaskClearable = useTaskStore((s) => s.editTaskClearable);
  const setIndentLevel = useTaskStore((s) => s.setIndentLevel);
  const insertTaskAfter = useTaskStore((s) => s.insertTaskAfter);
  const displayName = useAppStore((s) => s.displayName);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const allDone = tasks.length > 0 && incompleteTasks.length === 0;

  // ── effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (allDone && isLoaded) {
      setConfettiKey((k) => k + 1);
    }
  }, [allDone, isLoaded]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardVisible(false);
      setFocusedTaskId(null);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    syncTasksToSharedStorage(tasks);
    if (allDone) {
      screenTimeService.unblockAllApps();
      clearSharedStorage();
    } else if (incompleteTasks.length > 0) {
      screenTimeService.blockApps();
    }
  }, [allDone, incompleteTasks.length, isLoaded]);

  // ── color toolbar ──────────────────────────────────────────────────────
  const activeColor = focusedTaskId === "quickadd"
    ? quickAddColor
    : tasks.find((t) => t.id === focusedTaskId)?.color || Colors.taskColors.default;

  const handleColorSelect = useCallback((color: string) => {
    if (focusedTaskId === "quickadd") {
      setQuickAddColor(color);
    } else if (focusedTaskId) {
      editTaskColor(focusedTaskId, color);
    }
  }, [focusedTaskId, editTaskColor]);

  // ── quick-add ────────────────────────────────────────────────────────────
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

  // ── drag: compute drop target (called from UI thread via runOnJS) ──────
  const updateDropTarget = useCallback((ty: number, tx: number) => {
    const fromIdx = draggingFromIdxRef.current;
    if (fromIdx < 0) return;
    const currentTasks = tasksRef.current;
    const rawTo = fromIdx + Math.round(ty / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(currentTasks.length - 1, rawTo));

    const draggedTask = currentTasks[fromIdx];
    const currentLevel = draggedTask?.indentLevel || 0;
    const indentDelta = Math.round(tx / INDENT_SNAP);
    const newLevel = Math.max(0, Math.min(MAX_INDENT, currentLevel + indentDelta));

    setDropTargetIdx(clamped);
    setDropTargetIndent(newLevel);
  }, []);

  // ── drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((id: string, ghostTop: number) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (!task) return;
    draggingIdRef.current = id;
    draggingFromIdxRef.current = tasksRef.current.findIndex((t) => t.id === id);
    setGhostTask(task);
    setGhostPageY(ghostTop);
    setDraggingId(id);
    setDropTargetIdx(draggingFromIdxRef.current);
    setDropTargetIndent(task.indentLevel || 0);
  }, []);

  const handleDragUpdate = useCallback((tx: number, ty: number) => {
    updateDropTarget(ty, tx);
  }, [updateDropTarget]);

  const handleDragEnd = useCallback((tx: number, ty: number) => {
    const id = draggingIdRef.current;
    if (!id) return;

    const store = useTaskStore.getState();
    const latestTasks = store.tasks;
    const fromIdx = draggingFromIdxRef.current;

    const rawToIdx = fromIdx + Math.round(ty / ITEM_HEIGHT);
    const clampedToIdx = Math.max(0, Math.min(latestTasks.length - 1, rawToIdx));

    const draggedTask = latestTasks[fromIdx];
    if (!draggedTask) {
      draggingIdRef.current = null;
      setDraggingId(null);
      setGhostTask(null);
      setDropTargetIdx(null);
      return;
    }

    const otherTasks = latestTasks.filter((_, i) => i !== fromIdx);
    const insertAt = Math.min(clampedToIdx, otherTasks.length);
    const newOrder = [...otherTasks];
    newOrder.splice(insertAt, 0, draggedTask);
    store.reorderTasks(newOrder);

    // Calculate new indent level from horizontal drag
    const currentLevel = draggedTask.indentLevel || 0;
    const indentDelta = Math.round(tx / INDENT_SNAP);
    const newLevel = Math.max(0, Math.min(MAX_INDENT, currentLevel + indentDelta));
    if (newLevel !== currentLevel) {
      store.setIndentLevel(draggedTask.id, newLevel);
    }

    draggingIdRef.current = null;
    dragTX.value = withSpring(0);
    dragTY.value = withSpring(0);
    setDraggingId(null);
    setGhostTask(null);
    setDropTargetIdx(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!draggingId}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hello, {displayName}!</Text>
          <Text style={styles.headerSubtitle}>
            {allDone
              ? "Looks like you're all done for the day!"
              : "Here are your daily to-do's:"}
          </Text>
        </View>

        {/* Task list wrapper — onLayout captures top offset for indicator positioning */}
        <View onLayout={(e: LayoutChangeEvent) => setListTopOffset(e.nativeEvent.layout.y)}>
          {tasks.length === 0 && <EmptyState />}
          {tasks.map((item, idx) => (
            <TaskRow
              key={item.id}
              item={item}
              idx={idx}
              isFocused={focusedTaskId === item.id}
              draggingId={draggingId}
              dropTargetIdx={dropTargetIdx}
              dropTargetIndent={dropTargetIndent}
              dragTX={dragTX}
              dragTY={dragTY}
              handleDragStart={handleDragStart}
              handleDragUpdate={handleDragUpdate}
              handleDragEnd={handleDragEnd}
              tasksRef={tasksRef}
              focusTransferring={focusTransferring}
              setFocusedTaskId={setFocusedTaskId}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              editTask={editTask}
              setIndentLevel={setIndentLevel}
              insertTaskAfter={insertTaskAfter}
              setEditingTaskId={setEditingTaskId}
              setShowEditTimeSheet={setShowEditTimeSheet}
            />
          ))}
          {/* Indicator at the very end of the list */}
          {draggingId && dropTargetIdx === tasks.length - 1 && draggingId === tasks[tasks.length - 1]?.id && null}
          {draggingId && dropTargetIdx !== null && dropTargetIdx >= tasks.length && (
            <View
              style={[
                styles.dropIndicator,
                { marginLeft: dropTargetIndent * INDENT_STEP_PX },
              ]}
            />
          )}
        </View>

        {/* Quick-add input */}
        <View style={styles.inlineAddContainer}>
          <View style={styles.dragHandleSpacer} />
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
      </ScrollView>

      {/* Ghost — follows finger during drag */}
      {draggingId && ghostTask && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <DragGhost
            task={ghostTask}
            pageY={ghostPageY}
            dragTX={dragTX}
            dragTY={dragTY}
          />
        </View>
      )}

      {/* Color toolbar — always mounted; opacity avoids mount/unmount flash on focus */}
      <View
        style={[
          styles.colorToolbar,
          { top: insets.top + Spacing.lg, opacity: focusedTaskId ? 1 : 0 },
        ]}
        pointerEvents={focusedTaskId ? "auto" : "none"}
      >
        {COLOR_PALETTE.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.toolbarDot,
              { backgroundColor: c },
              activeColor === c && styles.toolbarDotSelected,
            ]}
            onPress={() => handleColorSelect(c)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {confettiKey > 0 && <Confetti key={confettiKey} />}

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

      <AddTaskSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={(title, dueTime, color, isClearable) => addTask(title, dueTime, color, isClearable)}
      />

      <EditTimeSheet
        visible={showEditTimeSheet}
        initialTime={tasks.find((t) => t.id === editingTaskId)?.dueTime}
        initialIsClearable={tasks.find((t) => t.id === editingTaskId)?.isClearable}
        onClose={() => {
          setShowEditTimeSheet(false);
          setEditingTaskId(null);
        }}
        onSave={(dueTime, isClearable) => {
          if (editingTaskId) editTaskTime(editingTaskId, dueTime, isClearable);
        }}
        onRemoveTime={(isClearable) => {
          if (editingTaskId) editTaskTime(editingTaskId, undefined, isClearable);
        }}
        onToggleClearable={(isClearable) => {
           if (editingTaskId) editTaskClearable(editingTaskId, isClearable);
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
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Didot",
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "400",
    fontFamily: "Didot",
  },
  list: {
    paddingBottom: 120,
  },
  dropIndicator: {
    height: 2,
    backgroundColor: "#007AFF",
    borderRadius: 1,
    marginVertical: 1,
  },
  inlineAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dragHandleSpacer: {
    width: 18,
    paddingRight: Spacing.sm,
  },
  inlineAddCheckboxMock: {
    paddingRight: Spacing.sm,
  },
  mockCheckboxBox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderRadius: 4,
  },
  inlineAddInput: {
    flex: 1,
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
    fontWeight: "600",
  },
  colorToolbar: {
    position: "absolute",
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },
  toolbarDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "transparent",
  },
  toolbarDotSelected: {
    borderColor: Colors.border,
    transform: [{ scale: 1.15 }],
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

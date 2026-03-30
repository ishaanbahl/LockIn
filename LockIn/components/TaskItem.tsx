import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Task } from "../types/task";
import { Colors, Spacing, FontSize } from "../constants/theme";
import { Checkbox } from "./Checkbox";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { runOnJS, SharedValue } from "react-native-reanimated";

const INDENT_STEP = 28; // px per indent level

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEditTime?: () => void;
  onEditTitle?: (title: string) => void;
  onChangeIndent?: (delta: number) => void;
  onAddNext?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  isDragging?: boolean;
  dragTX: SharedValue<number>;
  dragTY: SharedValue<number>;
  onDragStart: (id: string, ghostTop: number) => void;
  onDragUpdate?: (tx: number, ty: number) => void;
  onDragEnd: (tx: number, ty: number) => void;
}

function formatDueTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const mStrPad = mStr.padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${mStrPad} ${ampm}`;
}

function isTimeInPast(hhmm: string): boolean {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const due = new Date();
  due.setHours(h, m, 0, 0);
  return due < now;
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onEditTime,
  onEditTitle,
  onChangeIndent,
  onAddNext,
  onFocus,
  onBlur,
  isFocused,
  isDragging,
  dragTX,
  dragTY,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: TaskItemProps) {
  const [localTitle, setLocalTitle] = React.useState(task.title);
  const inputRef = React.useRef<TextInput>(null);
  const indentLevel = task.indentLevel || 0;

  React.useEffect(() => {
    if (isFocused && !inputRef.current?.isFocused()) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  React.useEffect(() => {
    setLocalTitle(task.title);
  }, [task.title]);

  const handleEndEditing = () => {
    onBlur?.();
    if (localTitle.trim() !== "") {
      onEditTitle?.(localTitle.trim());
    } else {
      setLocalTitle(task.title);
    }
  };

  const handleTextChange = (text: string) => {
    if (text.startsWith("  ") && onChangeIndent) {
      setLocalTitle(text.replace(/^ {2}/, ""));
      onChangeIndent(1);
    } else {
      setLocalTitle(text);
    }
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === "Backspace" && localTitle === "") {
      if (indentLevel > 0) {
        onChangeIndent?.(-1);
      } else {
        onDelete();
      }
    }
  };

  /** Only on :: handle — if the pan wraps the TextInput, taps to type briefly look "pressed"/hovered (RNGH vs native editor). */
  const dragGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(280)
        .minDistance(0)
        .shouldCancelWhenOutside(false)
        .onStart((e) => {
          dragTX.value = 0;
          dragTY.value = 0;
          const ghostTop = e.absoluteY - e.y;
          runOnJS(onDragStart)(task.id, ghostTop);
        })
        .onUpdate((e) => {
          dragTX.value = e.translationX;
          dragTY.value = e.translationY;
          if (onDragUpdate) runOnJS(onDragUpdate)(e.translationX, e.translationY);
        })
        .onEnd((e) => {
          runOnJS(onDragEnd)(e.translationX, e.translationY);
        }),
    [task.id, dragTX, dragTY, onDragStart, onDragUpdate, onDragEnd]
  );

  const isNew = React.useMemo(
    () => Date.now() - new Date(task.createdAt).getTime() < 1000,
    [task.createdAt]
  );

  const isPast = task.dueTime ? isTimeInPast(task.dueTime) : false;
  const currentTextColor = task.color || Colors.textPrimary;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingLeft: indentLevel * INDENT_STEP },
        isDragging && styles.dragging,
      ]}
    >
      <View style={styles.leftContent}>
        <GestureDetector gesture={dragGesture}>
          <View style={styles.dragHandle} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <Text style={styles.dragHandleText}>::</Text>
          </View>
        </GestureDetector>

        <Checkbox checked={task.isCompleted} onPress={onToggle} size={24} />

        <View style={styles.titleContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.title,
              { color: currentTextColor },
              task.isCompleted && styles.titleCompleted,
              task.isCompleted && { textDecorationLine: "line-through" },
            ]}
            value={localTitle}
            onChangeText={handleTextChange}
            onEndEditing={handleEndEditing}
            onFocus={() => onFocus?.()}
            onKeyPress={handleKeyPress}
            onSubmitEditing={() => onAddNext?.()}
            blurOnSubmit={false}
            returnKeyType="done"
            autoFocus={isNew && task.title === ""}
          />
        </View>
      </View>

      <View style={styles.rightContent}>
        <TouchableOpacity
          style={[styles.duePill, { backgroundColor: Colors.surfaceLight }]}
          onPress={onEditTime}
          activeOpacity={0.6}
          hitSlop={8}
        >
          {task.dueTime ? (
            <>
              <Text
                style={[
                  styles.dueLabel,
                  { color: Colors.textPrimary },
                  isPast && styles.pastDueText,
                ]}
              >
                DUE:{" "}
              </Text>
              <Text
                style={[
                  styles.dueTimeText,
                  { color: Colors.textPrimary },
                  isPast && styles.pastDueText,
                ]}
              >
                {formatDueTime(task.dueTime)}
              </Text>
            </>
          ) : (
            <Text style={[styles.dueTimeText, { color: Colors.textPrimary }]}>
              NO TIME SET
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export const INDENT_STEP_PX = INDENT_STEP;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: Spacing.xxs,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  dragging: {
    opacity: 0,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: Spacing.sm,
  },
  dragHandle: {
    paddingRight: Spacing.sm,
    justifyContent: "center",
    opacity: 0.3,
    paddingVertical: 5,
  },
  dragHandleText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    padding: 0,
  },
  titleCompleted: {
    opacity: 0.5,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  duePill: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  dueLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  dueTimeText: {
    fontSize: FontSize.xs,
    fontWeight: "400",
  },
  pastDueText: {
    color: Colors.danger,
  },
});

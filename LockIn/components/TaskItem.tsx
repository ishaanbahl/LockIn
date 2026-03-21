import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Task } from "../types/task";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { Checkbox } from "./Checkbox";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  useDerivedValue,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  drag?: () => void;
  isActive?: boolean;
  onEditTime?: () => void;
  onEditTitle?: (title: string) => void;
  onSetSubtask?: (isSubtask: boolean) => void;
  onAddNext?: (isSubtask: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  externalTranslateX?: SharedValue<number>;
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

const INDENT_THRESHOLD = 40;

export function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  drag, 
  isActive, 
  onEditTime, 
  onEditTitle, 
  onSetSubtask,
  onAddNext,
  onFocus,
  onBlur,
  isFocused,
  externalTranslateX
}: TaskItemProps) {
  const [localTitle, setLocalTitle] = React.useState(task.title);
  const inputRef = React.useRef<TextInput>(null);
  
  const localTranslateX = useSharedValue(0);
  
  // Use the external drag value if provided (for reordering indent), otherwise local
  const currentTranslateX = externalTranslateX || localTranslateX;

  const isIndentThresholdMet = useDerivedValue(() => {
    if (task.isSubtask) {
      return currentTranslateX.value < -INDENT_THRESHOLD;
    }
    return currentTranslateX.value > INDENT_THRESHOLD;
  });

  React.useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  React.useEffect(() => {
    setLocalTitle(task.title);
  }, [task.title]);

  // Reset localTranslateX when drag ends if no external value
  React.useEffect(() => {
    if (!isActive && !externalTranslateX) {
      localTranslateX.value = withSpring(0);
    }
  }, [isActive, externalTranslateX]);

  const handleEndEditing = () => {
    onBlur?.();
    if (localTitle.trim() !== "") {
      onEditTitle?.(localTitle.trim());
    } else {
      setLocalTitle(task.title); 
    }
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleTextChange = (text: string) => {
    if (text.startsWith("  ") && !task.isSubtask) {
      setLocalTitle(text.replace(/^ {2}/, ""));
      onSetSubtask?.(true);
    } else {
      setLocalTitle(text);
    }
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Backspace' && localTitle === '') {
      if (task.isSubtask) {
        onSetSubtask?.(false);
      } else {
        onDelete();
      }
    }
  };

  // Local pan for potential other actions, but the main reorder indent is handled by the parent's detector
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (isActive && !externalTranslateX) {
        localTranslateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (isActive && !externalTranslateX && isIndentThresholdMet.value) {
        runOnJS(onSetSubtask!)(!task.isSubtask);
      }
      localTranslateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: currentTranslateX.value }],
      opacity: isActive ? 0.9 : 1,
    };
  });

  const isNew = React.useMemo(() => {
    return Date.now() - new Date(task.createdAt).getTime() < 1000;
  }, [task.createdAt]);

  const isPast = task.dueTime ? isTimeInPast(task.dueTime) : false;
  const currentTextColor = task.color || Colors.textPrimary;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[
        styles.container,
        task.isSubtask && styles.indentedContainer,
        isActive && styles.containerActive,
        animatedStyle
      ]}>
        <View style={styles.leftContent}>
          <TouchableOpacity 
            onLongPress={drag} 
            delayLongPress={150} 
            style={styles.dragHandle}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dragHandleText}>::</Text>
          </TouchableOpacity>
          <Checkbox checked={task.isCompleted} onPress={onToggle} size={20} />
          <View style={styles.titleContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.title, 
                { color: currentTextColor },
                task.isCompleted && styles.titleCompleted,
                task.isCompleted && { textDecorationLine: 'line-through' }
              ]}
              value={localTitle}
              onChangeText={handleTextChange}
              onEndEditing={handleEndEditing}
              onFocus={handleFocus}
              onKeyPress={handleKeyPress}
              onSubmitEditing={() => onAddNext?.(task.isSubtask || false)}
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
                <Text style={[styles.dueLabel, { color: Colors.textPrimary }, isPast && styles.pastDueText]}>DUE: </Text>
                <Text style={[styles.dueTimeText, { color: Colors.textPrimary }, isPast && styles.pastDueText]}>{formatDueTime(task.dueTime)}</Text>
              </>
            ) : (
              <Text style={[styles.dueTimeText, { color: Colors.textPrimary }]}>NO TIME SET</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: Spacing.xs,
    paddingHorizontal: 0,
    marginBottom: 2,
  },
  indentedContainer: {
    paddingLeft: INDENT_THRESHOLD - 8,
  },
  containerActive: {
    transform: [{ scale: 1.02 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "transparent",
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
    paddingVertical: 10,
  },
  dragHandleText: {
    fontSize: FontSize.md,
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
    fontSize: FontSize.sm,
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
    fontSize: FontSize.xs - 2,
    fontWeight: "700",
  },
  dueTimeText: {
    fontSize: FontSize.xs - 2,
    fontWeight: "400",
  },
  pastDueText: {
    color: Colors.danger, 
  },
});

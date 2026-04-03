import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";
import { RemovableTaskToggle } from "./RemovableTaskToggle";

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, dueTime?: string, color?: string, isClearable?: boolean) => void;
}

const COLOR_PALETTE = [
  Colors.taskColors.default,
  Colors.taskColors.red,
  Colors.taskColors.blue,
  Colors.taskColors.green,
  Colors.taskColors.yellow,
];

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function toHHmm(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function AddTaskSheet({ visible, onClose, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(Colors.taskColors.default);
  const [isClearable, setIsClearable] = useState(false);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(
      trimmed,
      selectedTime ? toHHmm(selectedTime) : undefined,
      selectedColor !== Colors.taskColors.default ? selectedColor : undefined,
      isClearable
    );
    reset();
    onClose();
  };

  const reset = () => {
    setTitle("");
    setSelectedTime(null);
    setSelectedColor(Colors.taskColors.default);
    setShowTimePicker(false);
    setIsClearable(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setSelectedTime(date);
  };

  const handleToggleTimePicker = () => {
    Keyboard.dismiss();
    if (!selectedTime) {
      const d = new Date();
      d.setHours(23, 55, 0, 0);
      setSelectedTime(d);
    }
    setShowTimePicker((v) => !v);
  };

  const handleClearTime = () => {
    setSelectedTime(null);
    setShowTimePicker(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.heading}>Add to today's list</Text>

            <TextInput
              style={[styles.input, { color: selectedColor }]}
              placeholder="What do you need to do today?"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <View style={styles.inlineRow}>
              {COLOR_PALETTE.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorCircleSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}

              <TouchableOpacity
                style={[styles.timeButton, selectedTime && styles.timeButtonActive]}
                onPress={handleToggleTimePicker}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedTime && styles.timeButtonTextActive,
                  ]}
                >
                  {selectedTime ? formatTime(selectedTime) : "Set due time"}
                </Text>
              </TouchableOpacity>

              {selectedTime && (
                <TouchableOpacity
                  onPress={handleClearTime}
                  style={styles.clearTimeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearTimeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <RemovableTaskToggle
              value={isClearable}
              onValueChange={setIsClearable}
              style={{ marginBottom: Spacing.sm }}
            />

            {showTimePicker && selectedTime && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  minuteInterval={1}
                  textColor={Colors.textPrimary}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!title.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.md,
    flexWrap: "nowrap",
  },
  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleSelected: {
    borderColor: Colors.border,
    transform: [{ scale: 1.1 }],
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  timeButtonActive: {
    backgroundColor: Colors.primary + "22",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timeButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  timeButtonTextActive: {
    color: Colors.primaryLight,
  },
  clearTimeBtn: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  clearTimeText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: "flex-end",
    marginTop: Spacing.xs,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
});

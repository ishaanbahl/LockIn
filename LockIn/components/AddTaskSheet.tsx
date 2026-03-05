import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, dueTime?: string) => void;
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function toHHmm(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function AddTaskSheet({ visible, onClose, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, selectedTime ? toHHmm(selectedTime) : undefined);
    setTitle("");
    setSelectedTime(null);
    setShowTimePicker(false);
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setSelectedTime(null);
    setShowTimePicker(false);
    onClose();
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
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
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Sheet */}
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.heading}>Add to today's list</Text>

          <TextInput
            style={styles.input}
            placeholder="What do you need to do today?"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          {/* Time picker row */}
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={[
                styles.timeButton,
                selectedTime && styles.timeButtonActive,
              ]}
              onPress={() => {
                if (!selectedTime) {
                  // Default to 1 hour from now
                  const defaultTime = new Date();
                  defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0);
                  setSelectedTime(defaultTime);
                }
                setShowTimePicker(!showTimePicker);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clockIcon}>🕐</Text>
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

          {/* iOS inline time picker */}
          {showTimePicker && selectedTime && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                minuteInterval={5}
                textColor={Colors.textPrimary}
                themeVariant="dark"
              />
            </View>
          )}

          {/* Add button — compact */}
          <TouchableOpacity
            style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  timeButtonActive: {
    backgroundColor: Colors.primary + "22",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  clockIcon: {
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
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
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: "flex-end",
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
});

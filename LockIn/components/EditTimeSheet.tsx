import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";

interface EditTimeSheetProps {
  visible: boolean;
  initialTime?: string; // HH:mm
  onClose: () => void;
  onSave: (dueTime?: string) => void;
  onRemoveTime: () => void;
}

function parseHHmm(hhmm?: string): Date {
  const date = new Date();
  if (!hhmm) {
    date.setHours(23, 59, 0, 0);
    return date;
  }
  const [h, m] = hhmm.split(":");
  date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return date;
}

function toHHmm(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function EditTimeSheet({ visible, initialTime, onClose, onSave, onRemoveTime }: EditTimeSheetProps) {
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      setSelectedTime(parseHHmm(initialTime));
    }
  }, [visible, initialTime]);

  const handleSave = () => {
    onSave(toHHmm(selectedTime));
    onClose();
  };

  const handleClear = () => {
    onRemoveTime();
    onClose();
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.heading}>Edit Due Time</Text>
          
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              minuteInterval={1}
              textColor={Colors.textPrimary}
              themeVariant="dark" 
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearBtnText}>Remove Time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    alignItems: "center",
  },
  clearBtnText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
    alignItems: "center",
  },
  saveBtnText: {
    color: Colors.surface,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
});

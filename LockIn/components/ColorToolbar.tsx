import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { Colors, Spacing, BorderRadius } from "../constants/theme";

interface ColorToolbarProps {
  opacity: Animated.Value;
  onSelectColor: (color: string) => void;
  selectedColor?: string;
}

export function ColorToolbar({ opacity, onSelectColor, selectedColor }: ColorToolbarProps) {
  const COLOR_PALETTE = [
    Colors.taskColors.default,
    Colors.taskColors.red,
    Colors.taskColors.blue,
    Colors.taskColors.green,
    Colors.taskColors.yellow,
  ];

  const panOffset = React.useRef({ x: 0, y: 0 });
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      // Only claim the gesture if the user has actually moved, so taps on color circles still work
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset(panOffset.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        panOffset.current = {
          x: panOffset.current.x + gestureState.dx,
          y: panOffset.current.y + gestureState.dy,
        };
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.toolbar,
        {
          opacity,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.toolbarContent}>
        <Text style={styles.toolbarLabel}>TEXT COLOR:</Text>
        <View style={styles.paletteRow}>
          {COLOR_PALETTE.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.paletteCircle,
                { backgroundColor: c },
                selectedColor === c && styles.paletteCircleSelected,
              ]}
              onPress={() => onSelectColor(c)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: "absolute",
    bottom: Spacing.xxl + 80,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border + "44",
  },
  toolbarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  paletteRow: {
    flexDirection: "row",
    gap: 12,
  },
  paletteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paletteCircleSelected: {
    borderColor: Colors.border,
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
  },
});

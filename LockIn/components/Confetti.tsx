import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const COLORS = ["#D49A9A", "#97A5B8", "#A3B19E", "#C9BEA2", "#FFD700", "#FF69B4"];

interface ParticleProps {
  index: number;
}

const Particle = ({ index }: ParticleProps) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotate = useSharedValue(0);
  const size = Math.random() * 8 + 4;
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    const duration = 2500 + Math.random() * 2000;
    const delay = Math.random() * 1000;

    translateY.value = withDelay(delay, withTiming(height + 100, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }));

    translateX.value = withDelay(delay, withTiming(translateX.value + (Math.random() - 0.5) * 200, {
      duration,
    }));

    rotate.value = withDelay(delay, withTiming(720, { duration }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    backgroundColor: color,
    width: size,
    height: size,
    borderRadius: size / 2,
    position: "absolute",
    top: 0,
    left: 0,
  }));

  return <Animated.View style={animatedStyle} />;
};

export function Confetti() {
  const particles = Array.from({ length: 50 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
}

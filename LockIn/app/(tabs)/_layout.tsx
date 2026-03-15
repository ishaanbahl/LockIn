import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: Colors.surfaceLight, // Light gray
          borderTopColor: Colors.border,
          height: 80,
          paddingBottom: 25, // For iOS home indicator
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary, // Black
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false, // We'll build our own header in index.tsx
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

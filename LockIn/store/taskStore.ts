import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/task";

const STORAGE_KEY = "lockin_tasks";

interface TaskState {
  tasks: Task[];
  isLoaded: boolean;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (title: string, dueTime?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  clearCompleted: () => void;
  clearAll: () => void;

  // Computed helpers
  incompleteTasks: () => Task[];
  allComplete: () => boolean;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoaded: false,

  loadTasks: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ tasks: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addTask: (title, dueTime) => {
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title,
      isCompleted: false,
      ...(dueTime ? { dueTime } : {}),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.tasks, newTask];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  toggleTask: (id) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  editTask: (id, title) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, title } : t
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  reorderTasks: (reordered) => {
    set(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
      return { tasks: reordered };
    });
  },

  clearCompleted: () => {
    set((state) => {
      const updated = state.tasks.filter((t) => !t.isCompleted);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  clearAll: () => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    set({ tasks: [] });
  },

  incompleteTasks: () => get().tasks.filter((t) => !t.isCompleted),
  allComplete: () => {
    const tasks = get().tasks;
    return tasks.length > 0 && tasks.every((t) => t.isCompleted);
  },
}));

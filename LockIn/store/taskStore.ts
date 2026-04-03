import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/task";

const STORAGE_KEY = "lockin_tasks";

interface TaskState {
  tasks: Task[];
  isLoaded: boolean;

  loadTasks: () => Promise<void>;
  addTask: (title: string, dueTime?: string, color?: string, isClearable?: boolean) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
  editTaskTime: (id: string, dueTime?: string, isClearable?: boolean) => void;
  editTaskColor: (id: string, color?: string) => void;
  editTaskClearable: (id: string, isClearable: boolean) => void;
  setSubtask: (id: string, isSubtask: boolean) => void;
  setIndentLevel: (id: string, level: number) => void;
  insertTaskAfter: (id: string, isSubtask?: boolean, color?: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  clearClearableTasks: () => void;

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
        const parsed: Task[] = JSON.parse(stored);
        // Migrate: convert old isSubtask boolean to indentLevel
        const migrated = parsed.map((t) => {
          if (t.isSubtask && !t.indentLevel) {
            return { ...t, indentLevel: 1, isSubtask: undefined };
          }
          return t;
        });
        set({ tasks: migrated, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addTask: (title, dueTime, color, isClearable) => {
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title,
      isCompleted: false,
      ...(dueTime ? { dueTime } : {}),
      ...(color ? { color } : {}),
      ...(isClearable ? { isClearable } : {}),
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

  editTaskTime: (id, dueTime, isClearable) => {
    set((state) => {
      const updated = state.tasks.map((t) => {
        if (t.id === id) {
          const newTask = { ...t };
          if (dueTime) {
            newTask.dueTime = dueTime;
          } else {
            delete newTask.dueTime;
          }
          if (isClearable !== undefined) {
             newTask.isClearable = isClearable;
          }
          return newTask;
        }
        return t;
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  editTaskColor: (id, color) => {
    set((state) => {
      const updated = state.tasks.map((t) => {
        if (t.id === id) {
          const newTask = { ...t };
          if (color) {
            newTask.color = color;
          } else {
            delete newTask.color;
          }
          return newTask;
        }
        return t;
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  editTaskClearable: (id, isClearable) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, isClearable } : t
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  // Legacy — kept for backward compat but maps to indentLevel
  setSubtask: (id, isSubtask) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, indentLevel: isSubtask ? 1 : 0, isSubtask: undefined } : t
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  setIndentLevel: (id, level) => {
    set((state) => {
      const clamped = Math.max(0, level);
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, indentLevel: clamped, isSubtask: undefined } : t
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { tasks: updated };
    });
  },

  insertTaskAfter: (id, isSubtask = false, color) => {
    const parentTask = get().tasks.find((t) => t.id === id);
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title: "",
      isCompleted: false,
      indentLevel: parentTask?.indentLevel || (isSubtask ? 1 : 0),
      ...(color ? { color } : {}),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index === -1) return state;
      const updated = [
        ...state.tasks.slice(0, index + 1),
        newTask,
        ...state.tasks.slice(index + 1),
      ];
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

  clearClearableTasks: () => {
    set((state) => {
      const updated = state.tasks.filter((t) => !t.isClearable);
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

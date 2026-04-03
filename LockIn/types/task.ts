export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueTime?: string; // "HH:mm" format, optional
  createdAt: string; // ISO string
  isSubtask?: boolean; // kept for backward compat with persisted data
  indentLevel?: number; // 0 = top-level, 1+ = nested
  color?: string;
  isClearable?: boolean;
}

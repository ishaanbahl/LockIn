export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueTime?: string; // "HH:mm" format, optional
  createdAt: string; // ISO string
}

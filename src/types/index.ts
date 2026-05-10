export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type TodosByDate = Record<string, Todo[]>;

export interface Background {
  type: 'color' | 'image';
  value: string; // color: hex; image: file:// url
}

export type CalendarMode = 'day' | 'week' | 'month';
export type ViewMode = 'todo' | 'calendar';

declare global {
  interface Window {
    electronAPI: {
      getAll: () => Promise<{
        todosByDate: TodosByDate;
        background: Background;
        calendarMode: CalendarMode;
      }>;
      setTodos: (todosByDate: TodosByDate) => Promise<void>;
      setBackground: (bg: Background) => Promise<void>;
      setCalendarMode: (mode: CalendarMode) => Promise<void>;
      pickImage: () => Promise<string | null>;
      minimize: () => void;
      close: () => void;
      toggleAlwaysOnTop: () => void;
    };
  }
}

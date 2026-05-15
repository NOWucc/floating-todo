import { create } from 'zustand';
import type { Todo, TodosByDate, Background, CalendarMode, ViewMode } from '../types';
import { toDateKey, today } from '../utils/date';

interface AppState {
  todosByDate: TodosByDate;
  selectedDate: Date;
  viewMode: ViewMode;
  calendarMode: CalendarMode;
  background: Background;
  loaded: boolean;
  apiError: string | null;

  loadAll: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  setSelectedDate: (date: Date) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  setBackground: (bg: Background) => void;
  previewBackground: (bg: Background) => void;
}

// 安全访问 electronAPI
const api = () => (typeof window !== 'undefined' ? window.electronAPI : undefined);

const persistTodos = (todos: TodosByDate) => {
  api()?.setTodos(todos);
};

export const useAppStore = create<AppState>((set, get) => ({
  todosByDate: {},
  selectedDate: today(),
  viewMode: 'todo',
  calendarMode: 'month',
  background: { type: 'color', value: '#FFF6B7', opacity: 1 },
  loaded: false,
  apiError: null,

  loadAll: async () => {
    const a = api();
    if (!a) {
      console.error('[store] electronAPI is not available — preload failed?');
      set({
        loaded: true,
        apiError: 'electronAPI 未就绪：preload 脚本未加载。请检查终端日志。',
      });
      return;
    }
    try {
      const data = await a.getAll();
      set({
        todosByDate: data.todosByDate || {},
        background: data.background
          ? { ...data.background, opacity: data.background.opacity ?? 1 }
          : { type: 'color', value: '#FFF6B7', opacity: 1 },
        calendarMode: data.calendarMode || 'month',
        loaded: true,
      });
    } catch (err) {
      console.error('[store] loadAll failed:', err);
      set({ loaded: true, apiError: String(err) });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setCalendarMode: (mode) => {
    set({ calendarMode: mode });
    api()?.setCalendarMode(mode);
  },

  setSelectedDate: (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    set({ selectedDate: d });
  },

  addTodo: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = toDateKey(get().selectedDate);
    const list = get().todosByDate[key] || [];
    const newTodo: Todo = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    };
    const next = { ...get().todosByDate, [key]: [...list, newTodo] };
    set({ todosByDate: next });
    persistTodos(next);
  },

  toggleTodo: (id) => {
    const key = toDateKey(get().selectedDate);
    const list = get().todosByDate[key] || [];
    const updated = list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    const next = { ...get().todosByDate, [key]: updated };
    set({ todosByDate: next });
    persistTodos(next);
  },

  editTodo: (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = toDateKey(get().selectedDate);
    const list = get().todosByDate[key] || [];
    const updated = list.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
    const next = { ...get().todosByDate, [key]: updated };
    set({ todosByDate: next });
    persistTodos(next);
  },

  deleteTodo: (id) => {
    const key = toDateKey(get().selectedDate);
    const list = get().todosByDate[key] || [];
    const updated = list.filter((t) => t.id !== id);
    const next = { ...get().todosByDate, [key]: updated };
    if (updated.length === 0) delete next[key];
    set({ todosByDate: next });
    persistTodos(next);
  },

  setBackground: (bg) => {
    set({ background: bg });
    api()?.setBackground(bg);
  },

  previewBackground: (bg) => {
    set({ background: bg });
    // 不调用 api，不持久化——仅用于调色盘实时预览
  },
}));

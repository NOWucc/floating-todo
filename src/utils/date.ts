// 统一日期键格式：YYYY-MM-DD
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fromDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// 友好显示格式：2026.4.26
export const formatDisplay = (d: Date): string => {
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

export const today = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// 月视图：返回 6 行 7 列的日期网格（含上月末尾、下月开头）
export const getMonthGrid = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = 周日
  const grid: Date[] = [];
  // 从该周的周日开始
  const start = new Date(year, month, 1 - startWeekday);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push(d);
  }
  return grid;
};

// 周视图：返回当前周的 7 天（周日到周六）
export const getWeekDays = (date: Date): Date[] => {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

export const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

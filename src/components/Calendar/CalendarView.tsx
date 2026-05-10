import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import { today } from '../../utils/date';

export default function CalendarView() {
  const calendarMode = useAppStore((s) => s.calendarMode);
  const setCalendarMode = useAppStore((s) => s.setCalendarMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const background = useAppStore((s) => s.background);

  // 日历视图当前的"中心日期"，用于导航上一个/下一个
  const [cursor, setCursor] = useState<Date>(today());

  const cardStyle: React.CSSProperties =
    background.type === 'color'
      ? { background: background.value }
      : {
          backgroundImage: `url("${background.value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };

  const navigate = (delta: number) => {
    const next = new Date(cursor);
    if (calendarMode === 'month') next.setMonth(cursor.getMonth() + delta);
    else if (calendarMode === 'week') next.setDate(cursor.getDate() + 7 * delta);
    else next.setDate(cursor.getDate() + delta);
    setCursor(next);
  };

  return (
    <div className="h-full w-full p-2 pt-3">
      <div
        className="relative h-full w-full rounded-2xl shadow-xl flex flex-col overflow-hidden"
        style={cardStyle}
      >
        {/* 顶栏 */}
        <div className="drag-region flex items-center justify-between px-3 pt-2 pb-2 bg-white/40">
          <button
            onClick={() => setViewMode('todo')}
            className="no-drag flex items-center gap-1 px-2 py-1 rounded text-xs bg-white shadow border border-black/10 hover:bg-gray-50"
            title="返回待办卡片"
          >
            ← 返回卡片
          </button>

          {/* 模式切换 */}
          <div className="no-drag flex bg-white/70 rounded-md overflow-hidden text-xs border border-black/10">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setCalendarMode(m)}
                className={`px-2 py-1 ${
                  calendarMode === m
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {m === 'day' ? '日' : m === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>

          <div className="no-drag flex gap-1">
            <button
              onClick={() => window.electronAPI.minimize()}
              className="w-6 h-6 rounded hover:bg-black/10 text-sm"
              title="最小化"
            >
              −
            </button>
            <button
              onClick={() => window.electronAPI.close()}
              className="w-6 h-6 rounded hover:bg-red-400/40 text-sm"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 导航条 */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/30 no-drag">
          <button
            onClick={() => navigate(-1)}
            className="px-2 py-0.5 rounded hover:bg-black/10 text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => setCursor(today())}
            className="text-xs px-2 py-0.5 rounded hover:bg-black/10"
            title="回到今天"
          >
            今天
          </button>
          <button
            onClick={() => navigate(1)}
            className="px-2 py-0.5 rounded hover:bg-black/10 text-sm"
          >
            ›
          </button>
        </div>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto bg-white/20 no-drag">
          {calendarMode === 'month' && <MonthView cursor={cursor} />}
          {calendarMode === 'week' && <WeekView cursor={cursor} />}
          {calendarMode === 'day' && <DayView cursor={cursor} setCursor={setCursor} />}
        </div>
      </div>
    </div>
  );
}

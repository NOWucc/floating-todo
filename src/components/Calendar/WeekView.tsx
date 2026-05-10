import { useAppStore } from '../../store/useAppStore';
import { getWeekDays, isSameDay, today, toDateKey } from '../../utils/date';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function WeekView({ cursor }: { cursor: Date }) {
  const todosByDate = useAppStore((s) => s.todosByDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const days = getWeekDays(cursor);
  const todayDate = today();

  const handleClickDay = (d: Date) => {
    setSelectedDate(d);
    setViewMode('todo');
  };

  return (
    <div className="p-3 space-y-2">
      <div className="text-center text-sm font-semibold mb-2 text-gray-800">
        {days[0].getMonth() + 1}/{days[0].getDate()} – {days[6].getMonth() + 1}/
        {days[6].getDate()}
      </div>

      {days.map((d, i) => {
        const key = toDateKey(d);
        const todos = todosByDate[key] || [];
        const isToday = isSameDay(d, todayDate);
        return (
          <button
            key={i}
            onClick={() => handleClickDay(d)}
            className={`w-full text-left rounded-lg p-2 transition flex gap-3 ${
              isToday ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white/70 hover:bg-white'
            }`}
          >
            <div className="flex flex-col items-center w-10 flex-shrink-0">
              <span className="text-[10px] text-gray-500">{WEEKDAYS[d.getDay()]}</span>
              <span className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                {d.getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {todos.length === 0 ? (
                <span className="text-xs text-gray-400 italic">无待办</span>
              ) : (
                <ul className="space-y-0.5">
                  {todos.slice(0, 3).map((t) => (
                    <li
                      key={t.id}
                      className={`text-xs truncate ${
                        t.done ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      • {t.text}
                    </li>
                  ))}
                  {todos.length > 3 && (
                    <li className="text-[10px] text-gray-500">
                      +{todos.length - 3} 更多…
                    </li>
                  )}
                </ul>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

import { useAppStore } from '../../store/useAppStore';
import { getMonthGrid, isSameDay, today, toDateKey } from '../../utils/date';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function MonthView({ cursor }: { cursor: Date }) {
  const todosByDate = useAppStore((s) => s.todosByDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = getMonthGrid(year, month);
  const todayDate = today();

  const handleClickDay = (d: Date) => {
    setSelectedDate(d);
    setViewMode('todo');
  };

  return (
    <div className="p-3">
      <div className="text-center text-sm font-semibold mb-2 text-gray-800">
        {year} 年 {month + 1} 月
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] text-gray-600 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const key = toDateKey(d);
          const todos = todosByDate[key] || [];
          const total = todos.length;
          const doneCount = todos.filter((t) => t.done).length;
          const allDone = total > 0 && doneCount === total;
          const isToday = isSameDay(d, todayDate);

          return (
            <button
              key={i}
              onClick={() => handleClickDay(d)}
              className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition relative ${
                inMonth ? 'bg-white/70 hover:bg-white' : 'bg-white/30 text-gray-400'
              } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
              title={
                total > 0 ? `${doneCount}/${total} 已完成` : '空白日，点击新增'
              }
            >
              <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                {d.getDate()}
              </span>
              {total > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      allDone
                        ? 'bg-green-500'
                        : doneCount > 0
                        ? 'bg-yellow-500'
                        : 'bg-orange-400'
                    }`}
                  />
                  <span className="text-[9px] text-gray-500">{total}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-600 justify-center">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" /> 全未完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> 进行中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> 全完成
        </span>
      </div>
    </div>
  );
}

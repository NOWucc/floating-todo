import { useAppStore } from '../../store/useAppStore';
import { formatDisplay, toDateKey } from '../../utils/date';

interface Props {
  cursor: Date;
  setCursor: (d: Date) => void;
}

export default function DayView({ cursor }: Props) {
  const todosByDate = useAppStore((s) => s.todosByDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const key = toDateKey(cursor);
  const todos = todosByDate[key] || [];
  const doneCount = todos.filter((t) => t.done).length;

  const goToCard = () => {
    setSelectedDate(cursor);
    setViewMode('todo');
  };

  return (
    <div className="p-4">
      <div className="text-center mb-3">
        <div className="text-lg font-semibold text-gray-800">
          {formatDisplay(cursor)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {todos.length === 0
            ? '今日无记录'
            : `${doneCount} / ${todos.length} 已完成`}
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="text-center text-sm text-gray-500 italic py-8">
          这一天还没有任何待办
        </div>
      ) : (
        <ul className="space-y-1.5 mb-4">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80"
            >
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  t.done ? 'bg-green-500' : 'border border-gray-400'
                }`}
              />
              <span
                className={`text-sm ${
                  t.done ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {t.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={goToCard}
        className="w-full py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-900"
      >
        编辑这一天的待办 →
      </button>
    </div>
  );
}

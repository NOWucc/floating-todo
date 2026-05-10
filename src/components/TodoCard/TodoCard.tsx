import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { toDateKey, formatDisplay } from '../../utils/date';
import TodoItem from './TodoItem';
import CalendarTab from './CalendarTab';
import BackgroundSettings from './BackgroundSettings';

export default function TodoCard() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const todosByDate = useAppStore((s) => s.todosByDate);
  const background = useAppStore((s) => s.background);
  const addTodo = useAppStore((s) => s.addTodo);

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const dateKey = toDateKey(selectedDate);
  const todos = useMemo(() => todosByDate[dateKey] || [], [todosByDate, dateKey]);

  // 卡片背景样式
  const cardStyle: React.CSSProperties =
    background.type === 'color'
      ? { background: background.value }
      : {
          backgroundImage: `url("${background.value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTodo(input);
    setInput('');
  };

  return (
    <div className="h-full w-full p-2 pt-5">
      {/* 卡片本体 */}
      <div
        className="relative h-full w-full rounded-2xl shadow-xl flex flex-col overflow-visible"
        style={cardStyle}
      >
        {/* 日历标签按钮（左上方"贴纸"） */}
        <CalendarTab />

        {/* 顶部窗口拖动条 + 控制按钮 */}
        <div className="drag-region flex items-center justify-between px-4 pt-3 pb-1">
          <div className="text-base font-semibold text-gray-800/90 select-none">
            {formatDisplay(selectedDate)}
          </div>
          <div className="no-drag flex items-center gap-1">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-700"
              title="背景设置"
            >
              ⚙
            </button>
            <button
              onClick={() => window.electronAPI.minimize()}
              className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-700"
              title="最小化"
            >
              −
            </button>
            <button
              onClick={() => window.electronAPI.close()}
              className="w-7 h-7 rounded-full hover:bg-red-400/40 flex items-center justify-center text-gray-700"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 待办列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 no-drag">
          {todos.length === 0 ? (
            <div className="text-sm text-gray-600/80 italic mt-4 text-center">
              今天还没有任何待办，开始添加吧 ✏️
            </div>
          ) : (
            <ul className="space-y-1">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
          )}
        </div>

        {/* 底部输入框 */}
        <form
          onSubmit={handleAdd}
          className="no-drag p-3 border-t border-black/10 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新增待办（回车添加）"
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/60 text-sm placeholder-gray-500 focus:outline-none focus:bg-white/80"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-gray-800/80 text-white text-sm hover:bg-gray-900"
          >
            添加
          </button>
        </form>

        {/* 背景设置面板 */}
        {showSettings && (
          <BackgroundSettings onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

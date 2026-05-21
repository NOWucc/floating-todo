import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { toDateKey, formatDisplay } from '../../utils/date';
import TodoItem from './TodoItem';
import BackgroundSettings from './BackgroundSettings';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const PRAISE_MESSAGES = [
  "又拿下一个，势不可挡！",
  "干得漂亮，继续保持！",
  "稳稳完成，你真的很棒！",
  "搞定！效率满满的一天！",
  "很好，继续加油！",
  "完成任务，今天的你超厉害！",
  "nice！一步一步都算数！",
  "棒棒的，为自己鼓个掌！",
];
const PRAISE_EMOJIS = [
  "🎉", "🎊", "🍾", "✨", "🌟", "🏆", "💪", "👊", "👍", "🙌",
  "✌️", "🥳", "😊", "😎", "🐱", "☀️", "🌈", "✅", "☑️", "📌", "🚀", "🎯",
];
const PRAISE_KAOMOJIS = [
  "(๑•̀ㅂ•́)و✧",
  "٩(ˊᗜˋ*)و",
  "ヾ(≧▽≦*)o",
  "(ง •̀_•́)ง",
  "✧٩(ˊωˋ*)و✧",
  "(｡•̀ᴗ-)✧",
  "( •̀ ω •́ )✧",
  "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
  "(˶ᵔ ᵕ ᵔ˶)",
  "(｡･ω･｡)",
  "(´▽`ʃ♡ƪ)",
  "(づ｡◕‿‿◕｡)づ",
  "(๑˃ᴗ˂)ﻭ",
  "(´,,•ω•,,)",
  "٩(๑❛ᴗ❛๑)۶",
  "ᕦ(ò_óˇ)ᕤ",
];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shiftDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function TodoCard() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const todosByDate = useAppStore((s) => s.todosByDate);
  const background = useAppStore((s) => s.background);
  const praiseEnabled = useAppStore((s) => s.praiseEnabled);
  const addTodo = useAppStore((s) => s.addTodo);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);

  const setViewMode = useAppStore((s) => s.setViewMode);

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [praiseVisible, setPraiseVisible] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState('');
  const [praiseEmoji, setPraiseEmoji] = useState('');
  const [praiseKaomoji, setPraiseKaomoji] = useState('');

  const dateKey = toDateKey(selectedDate);
  const todos = useMemo(() => todosByDate[dateKey] || [], [todosByDate, dateKey]);

  const bgLayerStyle: React.CSSProperties =
    background.type === 'color'
      ? { backgroundColor: hexToRgba(background.value, background.opacity) }
      : {
          backgroundImage: `url("${background.value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: background.opacity,
        };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTodo(input);
    setInput('');
  };

  return (
    <div className="h-full w-full">
      {/* 卡片本体 */}
      <div className="relative h-full w-full flex flex-col overflow-hidden isolate">
        {/* 背景层：opacity 仅作用于此层，不影响内容 */}
        <div className="absolute inset-0 -z-10" style={bgLayerStyle} />
        {/* 顶部窗口拖动条 + 控制按钮 */}
        <div className="drag-region flex items-center justify-between px-4 pt-3 pb-1">
          <div className="no-drag flex items-center gap-1">
            <button
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-gray-700 text-sm leading-none"
              title="前一天"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-gray-800/90 select-none">
              {formatDisplay(selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-gray-700 text-sm leading-none"
              title="后一天"
            >
              ›
            </button>
          </div>
          <div className="no-drag flex items-center gap-1">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-700"
              title="背景设置"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-gray-700"
              title="打开日历视图"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
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
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onComplete={() => {
                    if (!praiseEnabled) return;
                    setPraiseEmoji(pick(PRAISE_EMOJIS));
                    setPraiseMessage(pick(PRAISE_MESSAGES));
                    setPraiseKaomoji(pick(PRAISE_KAOMOJIS));
                    setPraiseVisible(true);
                  }}
                />
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

        {praiseVisible && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div
              className="bg-white/95 backdrop-blur-sm flex flex-col items-center gap-2 px-6 py-5 mx-auto"
              style={{ width: 240, borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
            >
              <div className="text-xl leading-none text-gray-600">{praiseEmoji}</div>
              <div className="text-base font-semibold text-gray-800 text-center leading-snug">
                {praiseMessage}
              </div>
              <div className="text-xs text-gray-400">{praiseKaomoji}</div>
              <button
                onClick={() => setPraiseVisible(false)}
                className="mt-1 px-5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition"
              >
                知道啦
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

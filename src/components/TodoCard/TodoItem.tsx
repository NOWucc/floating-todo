import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Todo } from '../../types';

export default function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const editTodo = useAppStore((s) => s.editTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  const submit = () => {
    if (text.trim() && text !== todo.text) {
      editTodo(todo.id, text);
    } else {
      setText(todo.text);
    }
    setEditing(false);
  };

  return (
    <li className="group flex items-center gap-2 py-1 px-2 rounded hover:bg-black/5">
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition ${
          todo.done
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-500/60 hover:border-gray-700'
        }`}
        title={todo.done ? '标记为未完成' : '标记为完成'}
      >
        {todo.done && <span className="text-[10px]">✓</span>}
      </button>

      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
              setText(todo.text);
              setEditing(false);
            }
          }}
          className="flex-1 px-2 py-0.5 rounded bg-white/70 text-sm focus:outline-none"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 text-sm cursor-text select-text ${
            todo.done ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
          title="双击编辑"
        >
          {todo.text}
        </span>
      )}

      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 text-xs px-1 transition"
        title="删除"
      >
        ✕
      </button>
    </li>
  );
}

import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { toDateKey, formatDisplay } from '../../utils/date';

export default function DiaryView() {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const dateKey = toDateKey(selectedDate);

  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedTip, setSavedTip] = useState('');

  useEffect(() => {
    let cancelled = false;
    window.electronAPI.getDiary(dateKey).then((text) => {
      if (!cancelled) setContent(text || '');
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const handleSave = async () => {
    setSaving(true);
    setSavedTip('');
    try {
      await window.electronAPI.saveDiary(dateKey, content);
      setSavedTip('已保存到本地文件');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white/80">
      <div className="drag-region flex items-center justify-between px-3 pt-2 pb-2 border-b border-black/10">
        <button
          onClick={() => setViewMode('todo')}
          className="no-drag px-2 py-1 rounded text-xs bg-white shadow border border-black/10 hover:bg-gray-50"
        >
          返回待办
        </button>
        <div className="text-sm font-semibold text-gray-700">{formatDisplay(selectedDate)} 日记</div>
        <div className="no-drag flex gap-1">
          <button
            onClick={() => window.electronAPI.minimize()}
            className="w-6 h-6 rounded hover:bg-black/10 text-sm"
            title="最小化"
          >
            -
          </button>
          <button
            onClick={() => window.electronAPI.close()}
            className="w-6 h-6 rounded hover:bg-red-400/40 text-sm"
            title="关闭"
          >
            x
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 no-drag">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下今天的想法..."
          className="w-full h-full resize-none rounded-lg bg-white/90 border border-black/10 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div className="no-drag px-3 pb-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          本地文件: {dateKey}.md
        </div>
        <div className="flex items-center gap-2">
          {savedTip ? <span className="text-xs text-green-700">{savedTip}</span> : null}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-900 disabled:opacity-60"
          >
            {saving ? '保存中...' : '保存日记'}
          </button>
        </div>
      </div>
    </div>
  );
}

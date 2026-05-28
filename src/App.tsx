import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import TodoCard from './components/TodoCard/TodoCard';
import CalendarView from './components/Calendar/CalendarView';
import DiaryView from './components/Diary/DiaryView';

export default function App() {
  const viewMode = useAppStore((s) => s.viewMode);
  const loaded = useAppStore((s) => s.loaded);
  const loadAll = useAppStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!loaded) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
        加载中…
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {viewMode === 'todo' && <TodoCard />}
      {viewMode === 'calendar' && <CalendarView />}
      {viewMode === 'diary' && <DiaryView />}
    </div>
  );
}

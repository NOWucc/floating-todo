import { useAppStore } from '../../store/useAppStore';

export default function CalendarTab() {
  const setViewMode = useAppStore((s) => s.setViewMode);

  return (
    <button
      onClick={() => setViewMode('calendar')}
      className="no-drag absolute -top-2.5 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white shadow-md border border-black/10 text-xs text-gray-700 hover:bg-gray-50 active:scale-95 transition"
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}
      title="打开日历视图"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span className="font-medium">日历</span>
    </button>
  );
}

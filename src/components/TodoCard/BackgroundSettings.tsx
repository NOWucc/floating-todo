import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

const PRESET_COLORS = [
  '#FFF6B7', // 经典便签黄
  '#FFD3B6', // 桃粉
  '#FFAAA5', // 珊瑚红
  '#A8E6CF', // 薄荷绿
  '#B5EAD7', // 浅绿
  '#C7CEEA', // 淡紫
  '#FFDAC1', // 杏色
  '#E2F0CB', // 米绿
];

export default function BackgroundSettings({ onClose }: { onClose: () => void }) {
  const background = useAppStore((s) => s.background);
  const setBackground = useAppStore((s) => s.setBackground);
  const [hexInput, setHexInput] = useState(
    background.type === 'color' ? background.value : '#FFF6B7'
  );
  const [hexError, setHexError] = useState(false);

  const handleColor = (color: string) => {
    setBackground({ type: 'color', value: color });
  };

  const applyHex = () => {
    let v = hexInput.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      setHexError(false);
      setBackground({ type: 'color', value: v });
    } else {
      setHexError(true);
    }
  };

  const handlePickImage = async () => {
    const url = await window.electronAPI.pickImage();
    if (url) {
      setBackground({ type: 'image', value: url });
    }
  };

  return (
    <div className="absolute top-12 right-3 z-20 w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 no-drag">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">背景设置</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-1.5">预设颜色</div>
      <div className="grid grid-cols-8 gap-1.5 mb-3">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => handleColor(c)}
            className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>

      <div className="text-xs text-gray-600 mb-1.5">自定义颜色 (HEX)</div>
      <div className="flex gap-1.5 mb-1">
        <input
          type="text"
          value={hexInput}
          onChange={(e) => { setHexInput(e.target.value); setHexError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && applyHex()}
          placeholder="#FFE082"
          className={`flex-1 px-2 py-1 text-xs rounded border focus:outline-none ${hexError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'}`}
        />
        <button
          type="button"
          onClick={applyHex}
          className="px-3 py-1 text-xs rounded bg-gray-800 text-white hover:bg-gray-900"
        >
          应用
        </button>
      </div>
      {hexError && (
        <div className="text-[10px] text-red-500 mb-2">颜色格式无效，请输入如 #A1B2C3 或 #fff</div>
      )}
      {!hexError && <div className="mb-2" />}

      <div className="text-xs text-gray-600 mb-1.5">自定义图片</div>
      <button
        onClick={handlePickImage}
        className="w-full py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
      >
        选择本地图片…
      </button>

      {background.type === 'image' && (
        <div className="mt-2 text-[10px] text-gray-500">
          当前：已设置图片背景
        </div>
      )}
    </div>
  );
}

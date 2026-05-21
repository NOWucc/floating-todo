import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';
import type { Background } from '../../types';

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

// HSV(0-360, 0-100, 0-100) → RGB(0-255)
function hsvToRgb(h: number, s: number, v: number) {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// RGB(0-255) → HSV(0-360, 0-100, 0-100)
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else                h = ((r - g) / d + 4) * 60;
  }
  return {
    h: Math.round(h),
    s: max === 0 ? 0 : Math.round((d / max) * 100),
    v: Math.round(max * 100),
  };
}

function normalizeHex(hex: string): string | null {
  let v = hex.trim();
  if (!v.startsWith('#')) v = '#' + v;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return /^#[0-9A-Fa-f]{6}$/.test(v) ? v.toUpperCase() : null;
}

function hexToRgb(hex: string) {
  const v = normalizeHex(hex) ?? '#FFF6B7';
  return {
    r: parseInt(v.slice(1, 3), 16),
    g: parseInt(v.slice(3, 5), 16),
    b: parseInt(v.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0').toUpperCase()).join('');
}

export default function BackgroundSettings({ onClose }: { onClose: () => void }) {
  const background = useAppStore((s) => s.background);
  const setBackground = useAppStore((s) => s.setBackground);
  const previewBackground = useAppStore((s) => s.previewBackground);
  const praiseEnabled = useAppStore((s) => s.praiseEnabled);
  const setPraiseEnabled = useAppStore((s) => s.setPraiseEnabled);

  const [hexInput, setHexInput] = useState(
    background.type === 'color' ? background.value : '#FFF6B7'
  );
  const [hexError, setHexError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerHsv, setPickerHsv] = useState({ h: 0, s: 0, v: 100 });

  // 打开调色盘时快照，用于关闭时回滚
  const originalBg = useRef<Background>(background);
  const originalHex = useRef(hexInput);

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const pickerPopupRef = useRef<HTMLDivElement>(null);

  // 始终持有最新的关闭/回滚函数，避免 effect 中闭包过期
  const doClosePicker = useRef(() => {});
  doClosePicker.current = () => {
    previewBackground(originalBg.current);   // 回滚到打开前的背景
    setHexInput(originalHex.current);        // 回滚 HEX 输入框
    setShowPicker(false);
  };

  // 点击调色盘弹窗外部时关闭并回滚
  useEffect(() => {
    if (!showPicker) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (pickerPopupRef.current && !pickerPopupRef.current.contains(e.target as Node)) {
        doClosePicker.current();
      }
    };
    // 延迟一帧，避免开启调色盘的那次点击立刻触发关闭
    const t = setTimeout(() => document.addEventListener('mousedown', handleMouseDown), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [showPicker]);

  // 从 pickerHsv 派生当前选择颜色
  const tempRgb = hsvToRgb(pickerHsv.h, pickerHsv.s, pickerHsv.v);
  const tempHex = rgbToHex(tempRgb.r, tempRgb.g, tempRgb.b);
  const hueOnlyColor = `hsl(${pickerHsv.h}, 100%, 50%)`;
  const validHex = normalizeHex(hexInput);

  // 打开调色盘：保存快照，初始化 picker 状态
  const openPicker = () => {
    originalBg.current = { ...background };
    originalHex.current = hexInput;
    const rgb = hexToRgb(hexInput);
    setPickerHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    setShowPicker(true);
  };

  // 调色中：更新 picker 状态 + 实时预览（不保存）
  const applyPreview = (hex: string) => {
    setHexInput(hex);
    setHexError(false);
    previewBackground({ ...originalBg.current, type: 'color', value: hex });
  };

  // 饱和度/亮度区域拖拽
  const updateSv = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = svRef.current!.getBoundingClientRect();
    const s = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    const v = Math.round(Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100)));
    const next = { ...pickerHsv, s, v };
    setPickerHsv(next);
    const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
    applyPreview(rgbToHex(r, g, b));
  };

  // 色相滑块拖拽
  const updateHue = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = hueRef.current!.getBoundingClientRect();
    const h = Math.round(Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)));
    const next = { ...pickerHsv, h };
    setPickerHsv(next);
    const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
    applyPreview(rgbToHex(r, g, b));
  };

  // RGB 输入框编辑
  const handleRgbChange = (ch: 'r' | 'g' | 'b', raw: string) => {
    const n = Math.min(255, Math.max(0, parseInt(raw) || 0));
    const newRgb = { ...tempRgb, [ch]: n };
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setPickerHsv({ h: newHsv.s === 0 ? pickerHsv.h : newHsv.h, s: newHsv.s, v: newHsv.v });
    applyPreview(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // 点击"应用"：正式保存颜色，关闭弹窗
  const applyTempColor = () => {
    setBackground({ ...originalBg.current, type: 'color', value: tempHex });
    setHexInput(tempHex);
    setShowPicker(false);
  };

  // 预设颜色
  const handleColor = (color: string) => {
    setBackground({ ...background, type: 'color', value: color });
    setHexInput(color);
    setHexError(false);
  };

  // 应用 HEX 输入框
  const applyHex = () => {
    const v = normalizeHex(hexInput);
    if (v) {
      setHexError(false);
      setBackground({ ...background, type: 'color', value: v });
    } else {
      setHexError(true);
    }
  };

  const handlePickImage = async () => {
    const url = await window.electronAPI.pickImage();
    if (url) setBackground({ ...background, type: 'image', value: url });
  };

  const handleOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackground({ ...background, opacity: Number(e.target.value) / 100 });
  };

  return createPortal(
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] w-64 bg-white rounded-xl shadow-2xl border border-black/10 p-3 no-drag overflow-y-auto max-h-[calc(100vh-56px)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">设置</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm">✕</button>
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
      <div className="flex items-center gap-1.5 mb-1">
        <input
          type="text"
          value={hexInput}
          onChange={(e) => { setHexInput(e.target.value); setHexError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && applyHex()}
          placeholder="#FFE082"
          className={`flex-1 h-7 px-2 text-xs rounded border focus:outline-none ${hexError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'}`}
        />
        <button
          type="button"
          onClick={openPicker}
          className="w-7 h-7 rounded border border-gray-300 hover:border-gray-500 flex-shrink-0 transition"
          style={{ background: validHex ?? '#cccccc' }}
          title="打开调色盘"
        />
        <button
          type="button"
          onClick={applyHex}
          className="h-7 px-3 text-xs rounded bg-gray-800 text-white hover:bg-gray-900 whitespace-nowrap flex-shrink-0"
        >
          应用
        </button>
      </div>
      {hexError && (
        <div className="text-[10px] text-red-500 mb-1.5">颜色格式无效，请输入如 #A1B2C3 或 #fff</div>
      )}
      {!hexError && <div className="mb-2" />}

      {/* ── 调色盘弹窗 ── */}
      {showPicker && (
        <div ref={pickerPopupRef} className="mb-3 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
            <span className="text-xs font-semibold text-gray-700">调色盘</span>
            <button
              onClick={() => doClosePicker.current()}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>

          {/* 饱和度/亮度选择区 */}
          <div className="px-3 mb-2">
            <div
              ref={svRef}
              className="w-full h-32 rounded-lg cursor-crosshair relative select-none touch-none overflow-hidden"
              style={{
                background: `
                  linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1)),
                  linear-gradient(to right, rgba(255,255,255,1), ${hueOnlyColor})
                `,
              }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateSv(e); }}
              onPointerMove={(e) => { if (e.buttons > 0) updateSv(e); }}
            >
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 14, height: 14,
                  left: `${pickerHsv.s}%`,
                  top: `${100 - pickerHsv.v}%`,
                  transform: 'translate(-50%, -50%)',
                  background: tempHex,
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.35)',
                }}
              />
            </div>
          </div>

          {/* 色相滑块 */}
          <div className="px-3 mb-3">
            <div
              ref={hueRef}
              className="w-full h-3.5 rounded-full cursor-pointer relative select-none touch-none"
              style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateHue(e); }}
              onPointerMove={(e) => { if (e.buttons > 0) updateHue(e); }}
            >
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 16, height: 16,
                  left: `${(pickerHsv.h / 360) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: hueOnlyColor,
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>

          {/* RGB 输入 + 颜色预览 */}
          <div className="flex items-center gap-2 px-3 mb-2">
            {(['r', 'g', 'b'] as const).map((ch, i) => (
              <div key={ch} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-gray-400">{['R', 'G', 'B'][i]}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={tempRgb[ch]}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                  className="w-full h-7 px-1 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-gray-400 text-center"
                />
              </div>
            ))}
            <div
              className="flex-shrink-0 rounded-lg border border-gray-200"
              style={{ width: 28, height: 28, background: tempHex }}
            />
          </div>

          {/* HEX 值显示 */}
          <div className="px-3 mb-2.5">
            <div className="text-[11px] text-center font-mono text-gray-500 tracking-wider">{tempHex}</div>
          </div>

          {/* 应用按钮 */}
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={applyTempColor}
              className="w-full h-7 text-xs rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition"
            >
              应用
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 mb-1.5">自定义图片</div>
      <button
        onClick={handlePickImage}
        className="w-full py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
      >
        选择本地图片…
      </button>

      {background.type === 'image' && (
        <div className="mt-2 text-[10px] text-gray-500">当前：已设置图片背景</div>
      )}

      <div className="text-xs text-gray-600 mt-3 mb-1.5">透明度</div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(background.opacity * 100)}
          onChange={handleOpacity}
          className="flex-1 accent-gray-700"
        />
        <span className="text-xs text-gray-600 w-8 text-right tabular-nums">
          {Math.round(background.opacity * 100)}%
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-600">夸夸弹窗</span>
        <button
          type="button"
          onClick={() => setPraiseEnabled(!praiseEnabled)}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none"
          style={{ backgroundColor: praiseEnabled ? '#22c55e' : '#d1d5db' }}
          aria-label={praiseEnabled ? '关闭夸夸弹窗' : '开启夸夸弹窗'}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: praiseEnabled ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>
    </div>
  , document.body);
}

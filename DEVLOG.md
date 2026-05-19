# 开发记录

## 2026-05-15

### 新功能

**窗口透明度支持**
- Electron 主进程启用 `transparent: true`，`backgroundColor` 改为 `#00000000`，去掉阴影
- 背景层改为独立的绝对定位 `div`，通过 `opacity` 或 `rgba` 控制透明度，内容层不受影响

**调色盘（HSV 颜色选择器）**
- 在背景设置面板新增调色盘入口，弹出自定义 HSV 选色弹窗（SV 渐变面板 + Hue 色相条）
- 实时预览：拖动选色时通过 `previewBackground` 即时更新卡片背景，关闭弹窗或点击外部自动回滚到打开前的颜色
- 内置 HSV ↔ RGB ↔ HEX 互转工具函数，与已有 HEX 输入框联动同步

---

## 2026-05-11

### Bug 修复

**自定义 HEX 颜色无效**
- 原因：颜色校验正则过严（仅接受 `#RRGGBB`），且通过中间函数间接调用导致链路不可靠
- 修复：归一化输入（自动补 `#`、3位展开为6位），直接调用 `setBackground`，按钮加 `type="button"` 防止意外表单行为，输入非法时显示红色边框和错误提示

**本地图片背景不生效**
- 原因：主进程返回 `file:///` 路径，dev 模式下 renderer 运行于 `http://localhost`，跨协议加载被浏览器安全策略阻断；路径含中文时也未做 URL 编码
- 修复：`pickImage` 改为直接读取文件内容并返回 base64 data URL，彻底绕开路径和协议问题

### 界面调整

- 去掉卡片外层 padding，消除窗口背景（黄色）漏出的问题
- 日历入口从左上角独立标签移至右上角工具栏，按钮顺序：设置 → 日历 → 最小化 → 关闭
- 设置按钮图标从 Unicode 字符替换为等尺寸 SVG，与日历图标视觉一致

---

## 2026-05-10

### 项目初始化

- 基于 Electron + React + TypeScript + Tailwind CSS 搭建悬浮便签应用
- 核心功能：按日期管理 Todo 列表、日历视图（月/周/日）、背景颜色/图片设置、窗口拖拽与尺寸记忆
- 使用 `electron-store` 持久化数据，IPC 通道：`store:getAll`、`store:setTodos`、`store:setBackground`、`store:setCalendarMode`
- 窗口特性：无边框、置顶、可拖拽调整大小，启动时自动恢复上次位置和尺寸

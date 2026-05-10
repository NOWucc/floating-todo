# FloatingTodo - 悬浮待办 + 日历复盘

一个 Windows 桌面端的"悬浮便签待办 + 内置日历视图"应用。所有数据本地保存，无需联网，无需登录。

![preview](./docs/preview.png)

## ✨ 功能

### 悬浮待办卡片
- 🪟 **无边框透明悬浮窗** — 像一张便签贴在桌面上
- ↕️ **可拖动 + 可调整大小** — 位置和尺寸自动记忆
- 📅 **顶部显示日期** — 例 `2026.4.26`
- ✅ **待办事项管理** — 增删改、双击编辑、勾选完成（带删除线）
- 🎨 **背景设置** — 8 种预设便签色 + 自定义 HEX 颜色 + 本地图片背景

### 内置日历视图
- 点击卡片左上角的 **📅 日历** 标签按钮即可切换
- 支持 **日 / 周 / 月** 三种视图
- 月视图：每天显示完成进度（橙=未开始 / 黄=进行中 / 绿=全完成）
- 周视图：列表式查看一周事项
- 点击任意日期 → 切回待办卡片，编辑那一天的事项

### 数据持久化
所有数据（待办、卡片位置/尺寸、背景、视图模式）通过 `electron-store` 保存在系统用户目录：
```
%APPDATA%/FloatingTodo/config.json
%APPDATA%/FloatingTodo/backgrounds/      # 自定义图片背景
```

---

## 🚀 开发

### 环境要求
- Node.js 18+
- npm 9+
- Windows（开发与运行均可，打包目标也是 Windows）

### 启动开发模式
```bash
npm install
npm run dev
```

开发模式下窗口自带 DevTools，方便调试。

### 打包（生成 .exe）
```bash
npm run build
```

产物输出到 `release/`：
- `FloatingTodo-0.1.0-x64.exe` — NSIS 安装包
- `FloatingTodo-0.1.0-x64.exe`（portable）— 免安装便携版

### 仅生成解包目录（快速验证）
```bash
npm run build:dir
```

---

## 🏗️ 架构

```
floating-todo/
├── electron/              # 主进程
│   ├── main.ts            # 窗口管理、IPC、文件对话框
│   └── preload.ts         # 安全 IPC 桥
├── src/
│   ├── App.tsx            # 视图切换根组件
│   ├── components/
│   │   ├── TodoCard/      # 悬浮卡片 + 待办列表 + 背景设置
│   │   └── Calendar/      # 日 / 周 / 月视图
│   ├── store/             # Zustand 全局状态（含持久化桥接）
│   ├── utils/             # 日期工具
│   └── types/
├── electron-builder.yml   # 打包配置
└── .github/workflows/     # GitHub Actions 自动打包
```

**技术栈**：Electron 33 + React 18 + TypeScript + Tailwind CSS + Zustand + electron-store

---

## 📦 GitHub 自动发布

仓库已包含 `.github/workflows/build.yml`，推送 tag 即可自动打包并发 Release：

```bash
git tag v0.1.0
git push origin v0.1.0
```

Actions 会在 windows-latest 上构建并上传 `.exe` 到 GitHub Releases。

---

## 📋 后续可扩展功能

- [ ] 拖拽排序待办事项
- [ ] 待办优先级 / 标签
- [ ] 本地通知提醒
- [ ] 按周/月统计完成率图表
- [ ] 数据导出 / 导入（JSON）
- [ ] Markdown 支持

---

## 📄 License

MIT

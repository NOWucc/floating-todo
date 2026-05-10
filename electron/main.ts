import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import Store from 'electron-store';

console.log('[main] starting electron main process…');
console.log('[main] __dirname =', __dirname);
console.log('[main] VITE_DEV_SERVER_URL =', process.env.VITE_DEV_SERVER_URL);

interface StoreSchema {
  windowBounds?: { x: number; y: number; width: number; height: number };
  todosByDate?: Record<string, { id: string; text: string; done: boolean; createdAt: number }[]>;
  background?: { type: 'color' | 'image'; value: string };
  calendarMode?: 'day' | 'week' | 'month';
}

const store = new Store<StoreSchema>({
  defaults: {
    windowBounds: { x: 100, y: 100, width: 380, height: 520 },
    todosByDate: {},
    background: { type: 'color', value: '#FFF6B7' },
    calendarMode: 'month',
  },
});

let mainWindow: BrowserWindow | null = null;

// 自动查找 preload 文件（vite-plugin-electron 输出可能是 .js / .mjs / .cjs）
function resolvePreload(): string | undefined {
  const candidates = [
    path.join(__dirname, 'preload.mjs'),
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, 'preload.cjs'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      console.log('[main] preload found:', c);
      return c;
    }
  }
  console.error('[main] !!! preload NOT FOUND !!! tried:', candidates);
  return undefined;
}

function createWindow() {
  console.log('[main] createWindow()');
  const bounds = store.get('windowBounds') as StoreSchema['windowBounds'];
  const safe = bounds || { x: 100, y: 100, width: 380, height: 520 };

  const displays = screen.getAllDisplays();
  const isOnScreen = displays.some((d) => {
    const { x, y, width, height } = d.workArea;
    return (
      safe.x >= x - 50 &&
      safe.y >= y - 50 &&
      safe.x < x + width &&
      safe.y < y + height
    );
  });
  if (!isOnScreen) {
    safe.x = 100;
    safe.y = 100;
  }

  const preloadPath = resolvePreload();

  mainWindow = new BrowserWindow({
    x: safe.x,
    y: safe.y,
    width: safe.width,
    height: safe.height,
    minWidth: 280,
    minHeight: 320,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    backgroundColor: '#FFF6B7',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    console.log('[main] window ready-to-show');
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[main] did-fail-load', code, desc, url);
  });

  mainWindow.webContents.on('preload-error', (_e, p, error) => {
    console.error('[main] preload-error at', p, error);
  });

  const saveBounds = () => {
    if (!mainWindow) return;
    const b = mainWindow.getBounds();
    store.set('windowBounds', b);
  };
  mainWindow.on('moved', saveBounds);
  mainWindow.on('resized', saveBounds);

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('[main] loadURL', process.env.VITE_DEV_SERVER_URL);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('[main] loadFile', indexPath);
    mainWindow.loadFile(indexPath);
  }
}

// IPC
ipcMain.handle('store:getAll', () => ({
  todosByDate: store.get('todosByDate'),
  background: store.get('background'),
  calendarMode: store.get('calendarMode'),
}));
ipcMain.handle('store:setTodos', (_e, todosByDate) => {
  store.set('todosByDate', todosByDate);
});
ipcMain.handle('store:setBackground', (_e, bg) => {
  store.set('background', bg);
});
ipcMain.handle('store:setCalendarMode', (_e, mode) => {
  store.set('calendarMode', mode);
});
ipcMain.handle('dialog:pickImage', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath);
  const userData = app.getPath('userData');
  const bgDir = path.join(userData, 'backgrounds');
  if (!fs.existsSync(bgDir)) fs.mkdirSync(bgDir, { recursive: true });
  const destPath = path.join(bgDir, `bg_${Date.now()}${ext}`);
  fs.copyFileSync(srcPath, destPath);
  return `file:///${destPath.replace(/\\/g, '/')}`;
});
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.on('window:toggleAlwaysOnTop', () => {
  if (!mainWindow) return;
  mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
});

app.whenReady().then(() => {
  console.log('[main] app ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

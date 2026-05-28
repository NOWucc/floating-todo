import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 数据存取
  getAll: () => ipcRenderer.invoke('store:getAll'),
  setTodos: (todosByDate: any) => ipcRenderer.invoke('store:setTodos', todosByDate),
  setBackground: (bg: any) => ipcRenderer.invoke('store:setBackground', bg),
  setCalendarMode: (mode: string) => ipcRenderer.invoke('store:setCalendarMode', mode),
  setPraiseEnabled: (enabled: boolean) => ipcRenderer.invoke('store:setPraiseEnabled', enabled),
  getDiary: (dateKey: string) => ipcRenderer.invoke('diary:get', dateKey),
  saveDiary: (dateKey: string, content: string) => ipcRenderer.invoke('diary:save', dateKey, content),

  // 文件对话框
  pickImage: () => ipcRenderer.invoke('dialog:pickImage'),

  // 窗口控制
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  toggleAlwaysOnTop: () => ipcRenderer.send('window:toggleAlwaysOnTop'),
});

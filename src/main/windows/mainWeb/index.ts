import { BrowserWindow } from 'electron';
import { PathnameStore } from '../../store';
import { downloadEvent, newWindowEvent } from './event';

export function openMainWebWindow(mainWindow: BrowserWindow) {
  // TODO：启动 jar，获取空闲的端口号，然后传递给 renderer 进程

  downloadEvent(mainWindow);

  newWindowEvent(mainWindow);
  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null);
  }

  if (process.env.ODC_DEBUG_MODE === 'open' || process.env.NODE_ENV === 'development') {
    mainWindow!.webContents.openDevTools();
  }
  mainWindow!.loadURL(PathnameStore.getUrl());
  PathnameStore.reset();

  return mainWindow;
}

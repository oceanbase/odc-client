/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { app, BrowserWindow, dialog } from 'electron';
import { PathnameStore } from '../../store';
import log from '../../utils/log';
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

  mainWindow.webContents?.on('did-fail-load', (e, code, desc, url, isMainFrame, frameProcId) => {
    log.error('webcontent load failed', code, desc, url, isMainFrame, frameProcId);
    log.error(e);
  });
  mainWindow.webContents.on('certificate-error', (e) => {
    log.error('certificate-error', e);
  });
  mainWindow.webContents.on('render-process-gone', (e, details) => {
    log.error('render-process-gone', details.reason, details.exitCode);
    log.error(e);
  });
  mainWindow!.loadURL(PathnameStore.getUrl()).catch((e) => {
    log.error('loadURL error', e);
    dialog.showErrorBox(
      `Open ODC Window Failed`,
      `Please submit the log to the administrator（${app.getPath('userData')}/logs）`,
    );
    app.quit();
  });
  PathnameStore.reset();

  return mainWindow;
}

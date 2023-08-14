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

import { BrowserWindow } from 'electron';
import { mainWebWindowConfig } from '../../../main/config';
import log from '../../utils/log';

export function downloadEvent(mainWindow: BrowserWindow) {
  // 拦截 electron 默认的下载事件
  mainWindow!.webContents.session.on('will-download', async (event, item, webContents) => {
    if (!mainWindow) {
      return;
    }
    log.info(webContents.id, mainWindow.webContents.id);
    if (webContents.id !== mainWindow.webContents.id) {
      return;
    }
    const itemUrl = item.getURL();
    log.info(
      `download event(${item.eventNames()}): fileName:${item.getFilename()} itemUrl:${itemUrl}`,
    );
    return;
  });
}

export function newWindowEvent(mainWindow: BrowserWindow) {
  mainWindow.webContents.setWindowOpenHandler((detail) => {
    let newWindow: BrowserWindow;
    newWindow = new BrowserWindow({
      ...mainWebWindowConfig,
      width: mainWebWindowConfig.width,
      height: mainWebWindowConfig.height,
    });
    newWindowEvent(newWindow);
    downloadEvent(newWindow);
    if (process.platform !== 'darwin') {
      newWindow.setMenu(null);
    }
    newWindow.loadURL(detail.url);
    newWindow.show();
    if (process.env.ODC_DEBUG_MODE === 'open') {
      newWindow!.webContents.openDevTools();
    }
    return {
      action: 'deny',
    };
  });
  mainWindow.addListener('unresponsive', (e) => {
    log.error(`webcontent unresponsive, url: ${mainWindow.webContents.getURL()}`);
    log.error(e);
  });
  mainWindow.addListener('close', (e) => {
    log.warn(`webcontent close, url: ${mainWindow.webContents.getURL()}`);
    log.warn(e);
  });
  mainWindow.addListener('closed', (e) => {
    log.warn(`webcontent closed`);
  });
  if (process.platform !== 'darwin') {
    mainWindow.addListener('session-end', (e) => {
      log.warn(`webcontent session-end `);
      log.warn(e);
    });
  }
}

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

/**
 * 提供给render的服务
 */
import { app, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import MainServer from '../server/main';
import { default as clientLog } from '../utils/log';
import feedbackImpl from './feedback';
import { changePwd, checkProcessKey as _checkProcessKey, checkPwd, resetPwdAndDB } from './lock';

export function initRenderService() {
  ipcMain.handle('getMainServerPort', (e, ...args) => {
    return MainServer.getInstance().port;
  });

  ipcMain.handle('checkLockPwd', (e, pwd) => {
    const result = checkPwd(pwd);
    return result;
  });

  ipcMain.handle('changeLockPwd', (e, originPwd, pwd) => {
    return changePwd(originPwd, pwd);
  });

  ipcMain.handle('haveLock', (e) => {
    return !checkPwd('');
  });

  function restart() {
    app.relaunch();
    app.exit();
  }

  ipcMain.handle('resetSystem', async (e) => {
    await resetPwdAndDB();
    return restart();
  });

  ipcMain.handle('restart', async (e) => {
    return restart();
  });

  ipcMain.handle('checkProcessKey', (e, key) => {
    return _checkProcessKey(key);
  });

  ipcMain.handle('feedback', (e) => {
    return feedbackImpl();
  });

  ipcMain.handle('log', (e, msg: string, type: string) => {
    if (type === 'trace') {
      type = 'error';
    }
    if (typeof clientLog[type] === 'function') {
      clientLog[type](msg);
    }
    return;
  });
  ipcMain.handle('showItemInFolder', (e, filePath) => {
    shell.showItemInFolder(filePath);
    return;
  });
  ipcMain.handle('selectFolder', () => {
    const path = dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
    if (!path) {
      return '';
    } else {
      return path?.[0];
    }
  });

  ipcMain.handle('saveODCSetting', (e, settingText: string) => {
    const savePath = path.resolve(app.getPath('exe'), 'setting.json');
    /**
     * 保存内容settingText到文件 setting.json
     */
    fs.writeFileSync(savePath, settingText);
    return savePath;
  });

  ipcMain.handle('getODCSetting', (e) => {
    const savePath = path.resolve(app.getPath('exe'), 'setting.json');
    /**
     * 保存内容settingText到文件 setting.json
     */
    return fs.readFileSync(savePath).toString();
  });
}

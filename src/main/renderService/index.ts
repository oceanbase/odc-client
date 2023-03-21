/**
 * 提供给render的服务
 */
import { app, dialog, ipcMain, shell } from 'electron';
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
}

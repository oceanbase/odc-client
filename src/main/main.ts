import * as Sentry from '@sentry/electron';
import { app, BrowserWindow, screen } from 'electron';
import os from 'os';
import pkg from '../../package.json';
import createMenu from './createMenu';
import { initRenderService } from './renderService';
import MainServer from './server/main';
import setAboutPanelOptions from './setAboutPanel';
import { PathnameStore } from './store';
import { getParamsFromODCSchema, isODCSchemaUrl } from './utils';
import log from './utils/log';
import { openMainWebWindow } from './windows/mainWeb';
import startScreen from './windows/startScreen';

Sentry.init({
  dsn: 'https://859452cf23044aeda8677a8bdcc53081@obc-sentry.oceanbase.com/3',
});

initRenderService();
const gotTheLock = app.requestSingleInstanceLock();
process.on('uncaughtException', (e) => {
  log.info('uncaughtException');
  log.info(e);
});
app.commandLine.appendSwitch('disable-http-cache');
function resolveWinRemoteParams(argv) {
  if (argv.length > 1) {
    log.info('app opened with argv');
    const odcSchema = argv.find((a) => {
      return isODCSchemaUrl(a);
    });
    if (odcSchema) {
      PathnameStore.addParams(getParamsFromODCSchema(odcSchema));
    }
  }
}

log.info('getLockFinished');

log.info('APP Start');
log.info(`Mem: \n${JSON.stringify(process.getSystemMemoryInfo(), null, 4)}`);
log.info(`OS: \n${os.type()}
platform: ${os.platform()}
arch: ${os.arch()}
os_release: ${os.release()}
uptime: ${os.uptime()}
mem: ${os.totalmem()}
cpu: ${JSON.stringify(os.cpus())}
version: ${pkg?.version}`);

if (!gotTheLock) {
  log.info('app get lock fail');
  app.quit();
} else {
  log.info('app get lock success');
  initApp();
}
async function initApp() {
  app.on('second-instance', (event, argv) => {
    log.info('app second-instance');
    if (process.platform === 'win32') {
      /**
       * schema 外部打开
       */
      resolveWinRemoteParams(argv);
      if (MainServer.getInstance().status == 'ready') {
        log.info('app second-instance(open new window)');
        createNewMainWeb();
      }
    }
  });

  /**
   * 因为注册表安全原因，暂时不支持 url schema 方式
   */
  // registerProtocolClient();
  // log.info('register url schema');

  /**
   * 开启错误日志收集
   */
  // crashReporter.start({
  //   companyName: 'oceanbase',
  //   productName: 'ODC',
  //   submitURL: ''
  // });

  /**
   * 初始化
   */
  async function createNewMainWeb() {
    log.info('create new main web');
    let mainWindow = startScreen();
    let mainServer = MainServer.getInstance();
    await mainServer.startServer();
    log.info('create new main web(server start success)');
    mainWindow = openMainWebWindow(mainWindow);
    log.info('create new main web(window opened)');
  }

  /**
   * electron 主程序初始化完毕
   */
  app.on('ready', async () => {
    log.info('App Ready');
    log.info(
      `Screen: ${screen
        .getAllDisplays()
        .map((display) => `width: ${display.size.width}, height: ${display.size.height}`)
        .join(' | ')}`,
    );
    if (process.platform === 'darwin') {
      createMenu(app);
      setAboutPanelOptions(app);
      log.info('App Menu Ready');
    }
    // if (process.platform === 'win32') {
    //   /**
    //    * schema 外部打开
    //    */
    //   log.info('windows Schema resolved');
    //   resolveWinRemoteParams(process.argv);
    // }
    resolveWinRemoteParams(process.argv);
    createNewMainWeb();
  });

  /**
   * 所有窗口都关闭了
   */
  app.on('window-all-closed', () => {
    log.info('windows all closed');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', (e) => {
    log.info('app will quit:', e);
    if (!MainServer.getInstance().isKilled) {
      e.preventDefault();
      async function quit() {
        await MainServer.getInstance().stopServer(true);
        app.quit();
      }
      quit();
    }
  });

  /**
   * electron 主程序退出
   */
  app.on('quit', (e) => {
    log.info('app quit:', e, '\n\n');
  });

  /**
   * 主程序被激活
   */
  app.on('activate', () => {
    log.info('app activate');
    if (BrowserWindow.getAllWindows().length === 0) {
      log.info('windows length is 0, create new window');
      createNewMainWeb();
    }
  });

  /**
   * mac web唤起应用
   */
  app.on('open-url', async (event, urlStr) => {
    log.info('app open-url');
    if (urlStr) {
      log.info('app open-url(add params)');
      PathnameStore.addParams(getParamsFromODCSchema(urlStr));
    }
    const instance = MainServer.getInstance();
    if (instance.status == 'ready') {
      log.info('app open-url(ready and open new window)');
      createNewMainWeb();
    }
  });
}

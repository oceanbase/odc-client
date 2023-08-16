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

import { ChildProcess, spawn, spawnSync } from 'child_process';
import { app, dialog } from 'electron';
import { get } from 'http';
import path from 'path';
import kill from 'tree-kill';
import {
  checkJavaVersions,
  getAvailablePort,
  getJavaDBPath,
  getJavaLogPath,
  getJavaPath,
  getRendererPath,
} from '../utils';
import log from '../utils/log';

class MainServer {
  static _mainServer: MainServer = null;
  public port: number;
  public process: ChildProcess;
  public jarPath: string;
  public pluginPath: string;
  public starterPath: string;
  public status: 'ready' | 'loading' = 'loading';
  public isKilled: boolean = false;
  static getInstance() {
    if (!MainServer._mainServer) {
      MainServer._mainServer = new MainServer();
    }
    return MainServer._mainServer;
  }
  /**
   * 获取后端jar地址
   */
  private getJarPath() {
    // @see https://github.com/electron-userland/electron-builder/issues/3863
    let odcJarPath: string;
    // tslint:disable-next-line:prefer-conditional-expression
    if (process.env.ODC_SERVER_JAR_PATH) {
      odcJarPath = process.env.ODC_SERVER_JAR_PATH;
    } else if (process.env.NODE_ENV === 'development') {
      odcJarPath = path.join(process.cwd(), 'libraries', 'java', 'odc.jar');
    } else {
      // @see https://electronjs.org/docs/all#processresourcespath
      log.info('resourcesPath: ', process.resourcesPath);
      odcJarPath = path.join(process.resourcesPath || '', 'libraries', 'java', 'odc.jar');
    }
    this.jarPath = odcJarPath;
    return odcJarPath;
  }

  private getPluginsPath() {
    let pluginPath: string;
    // tslint:disable-next-line:prefer-conditional-expression
    if (process.env.ODC_SERVER_PLUGINS_PATH) {
      pluginPath = process.env.ODC_SERVER_PLUGINS_PATH;
    } else if (process.env.NODE_ENV === 'development') {
      pluginPath = path.join(process.cwd(), 'libraries', 'java', 'plugins');
    } else {
      // @see https://electronjs.org/docs/all#processresourcespath
      log.info('resourcesPath: ', process.resourcesPath);
      pluginPath = path.join(process.resourcesPath || '', 'libraries', 'java', 'plugins');
    }
    this.pluginPath = pluginPath;
    return pluginPath;
  }

  private getStartersPath() {
    let _path: string;
    // tslint:disable-next-line:prefer-conditional-expression
    if (process.env.ODC_SERVER_STARTERS_PATH) {
      _path = process.env.ODC_SERVER_STARTERS_PATH;
    } else if (process.env.NODE_ENV === 'development') {
      _path = path.join(process.cwd(), 'libraries', 'java', 'starters');
    } else {
      // @see https://electronjs.org/docs/all#processresourcespath
      log.info('resourcesPath: ', process.resourcesPath);
      _path = path.join(process.resourcesPath || '', 'libraries', 'java', 'starters');
    }
    this.starterPath = _path;
    return _path;
  }

  private getOBClientPath() {
    let obPath;
    let base;
    if (process.env.NODE_ENV === 'development') {
      base = process.cwd();
    } else {
      base = process.resourcesPath;
    }
    switch (process.platform) {
      case 'linux':
      case 'darwin': {
        obPath = path.join(base, 'libraries', 'obclient/bin/obclient');
        break;
      }
      default: {
        obPath = path.join(base, 'libraries', 'obclient', 'obclient.exe');
        break;
      }
    }
    log.info('obPath: ', obPath);
    return obPath;
  }

  /**
   * 获取可用的端口
   */
  private async getAvailablePort() {
    try {
      const port = await getAvailablePort();
      this.port = port;
    } catch (e) {
      log.error('getAvailablePort Failed:', e);
      process.exit(1);
    }
  }

  /**
   * 确认服务是否可用
   */
  private async checkServerIsReady() {
    try {
      await new Promise((resolve, reject) => {
        const res = get(`http://localhost:${this.port}/api/v1/info`, (resp) => {
          log.info('check server api status: ', resp.statusCode);
          let data = '';
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
          resp.on('end', () => {
            resolve(JSON.parse(data));
          });
        }).on('error', (err) => {
          log.info('check server with resp err');
          reject(err);
        });
        res.setTimeout(2000);
      });
      return true;
    } catch (e) {
      log.info('check server with false');
      return false;
    }
  }

  /**
   * 等待服务可用
   */
  private async waitServiceAvailable() {
    let count = 0;
    let now = Date.now();
    const getStatus = async (fn, reject) => {
      count++;
      log.info(`fetch server status count(${count})`);
      const isReady = await this.checkServerIsReady();
      if (isReady) {
        log.info(`Server startup time:`, (Date.now() - now) / 1000);
        fn(true);
      } else if (count > 70) {
        // 2分钟超时报错
        reject('timeout');
      } else {
        setTimeout(() => {
          getStatus(fn, reject);
        }, 4000);
      }
    };
    return new Promise((resolve, reject) => {
      getStatus(resolve, reject);
    });
  }

  /**
   * 启动服务
   */
  public async startServer() {
    if (this.status == 'ready') {
      return;
    }
    log.info('checking java version');
    const isJavaValid = await checkJavaVersions();
    if (!isJavaValid) {
      log.info('java version not pass, quit');
      app.quit();
      return;
    }
    await this.getAvailablePort();
    this.getJarPath();
    this.getPluginsPath();
    this.getStartersPath();
    const dbPath = getJavaDBPath();
    if (!dbPath) {
      log.error('元数据库路径获取失败！');
      dialog.showErrorBox(
        `元数据库路径获取失败！`,
        `请以管理员模式启动（日志目录：${app.getPath('userData')}/logs）`,
      );
      app.quit();
      return;
    }
    let javaChildProcess: ChildProcess;
    let javaLogDir = getJavaLogPath();
    let JAVA_HOME;
    let javaBin = 'java';
    const java = getJavaPath();
    if (java) {
      JAVA_HOME = java.JAVA_HOME;
      javaBin = java.javaBin;
      log.info('platform:', process.platform);
      if (process.platform === 'darwin') {
        /**
         * mac 需要给加一下执行权限
         */
        log.info('添加 java 执行权限');
        const result = spawnSync('chmod', ['a+x', javaBin]);
        log.info(result.error, result.stderr?.toString());
      }
    }
    let env = {
      ODC_WEB_STATIC_LOCATION: getRendererPath(),
      DB_PATH: dbPath,
      ODC_PROFILE_MODE: 'clientMode',
      CLASSPATH: process.env.CLASSPATH,
      PATH: process.env.PATH,
      JAVA_HOME: process.env.JAVA_HOME,
      ODC_PLUGIN_DIR: this.pluginPath,
      ODC_STARTER_DIR: this.starterPath,
      'server.port': `${this.port}`,
      // obClient 文件上传目录
      'obclient.work.dir': path.join(app.getPath('userData'), 'data'),
      // 任务文件上传参数，后续任务会统一到这个目录下
      'file.storage.dir': path.join(app.getPath('userData'), 'data'),
      'obclient.file.path': this.getOBClientPath(),
    };
    if (JAVA_HOME) {
      env['JAVA_HOME'] = JAVA_HOME;
    }
    // https://stackoverflow.com/questions/10232192/exec-display-stdout-live
    try {
      javaChildProcess = spawn(
        javaBin,
        [
          `-Dodc.log.directory=${javaLogDir}`,
          `-Dfile.encoding=UTF-8`,
          `-Duser.language=en-US`,
          '-jar',
          this.jarPath,
        ],
        {
          // 一定要设置，默认值为 '/'，会影响到后端日志文件的存放路径
          // https://electronjs.org/docs/all#appgetpathname
          cwd: app.getPath('userData'),
          env,
        },
      );
    } catch (e) {
      log.error('spawn java process error: ', e);
      /**
       * 非自身kill，需要报错，并且退出
       */
      log.error('Java 进程启动失败!');
      dialog.showErrorBox(e.toString(), `请尝试重新启动（日志目录：${javaLogDir})`);
      this.isKilled = true;
      app.quit();
      return;
    }
    log.info(`
    system env
    ${Object.keys(process.env).join('\n')}
    `);
    log.info(`
      runJavaProcess 
      jar: ${this.jarPath}
      cwd: ${app.getPath('userData')}
      env: ${JSON.stringify(env, null, 4)}
    `);
    // if (process.env.NODE_ENV === 'development') {
    javaChildProcess.stdout.on('data', (data) => {
      // tslint:disable-next-line:no-console
      console.log('stdout: ' + data.toString());
    });

    javaChildProcess.stderr.on('data', (data) => {
      // tslint:disable-next-line:no-console
      console.log('stderr: ' + data.toString());
    });
    javaChildProcess.on('exit', (code, signal) => {
      // tslint:disable-next-line:no-console
      log.info('Java process exited with code ' + code + ', signal ' + signal);
      if (!this.isKilled) {
        /**
         * 非自身kill，需要报错，并且退出
         */
        log.error('Java 进程异常退出!');
        dialog.showErrorBox(`Java 进程异常退出`, `请尝试重新启动（日志目录：${javaLogDir})`);
        this.isKilled = true;
        app.quit();
      }
    });

    this.process = javaChildProcess;
    try {
      // 进程启动之后再打开浏览器
      await this.waitServiceAvailable();
    } catch (e) {
      // 启动失败
      log.error('Run Server Failed: ', e);
      this.isKilled = true;
      dialog.showErrorBox(`Java 进程启动失败`, `请尝试重新启动（日志目录：${javaLogDir})`);
      app.quit();
      return;
    }
    log.info(`Main Server Start Success(port=${this.port}, path=${this.jarPath})!!!!!`);
    this.status = 'ready';
  }

  /**
   * windows SIGSTOP
   */
  private getSign() {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      return 'SIGTERM';
    }
    return 'SIGSTOP';
  }

  public async stopServer(force?: boolean) {
    // 尝试结束子进程（后端服务）
    // @see https://stackoverflow.com/questions/18694684/spawn-and-kill-a-process-in-node-js
    const sign = this.getSign();
    if (this.process) {
      return new Promise((resolve) => {
        log.info(`Before Kill Main Server(pid=${this.process.pid})`);
        if (force) {
          kill(this.process.pid, sign, (error) => {
            log.info('force stop ', error);
            log.info('停止进程完成');
            resolve(true);
          });
        } else {
          kill(this.process.pid, (error) => {
            setTimeout(() => {
              this.process.kill(sign);
            }, 200);
            log.info('[kill tree pid]', error);
          });
        }
        log.info('Kill Main Server Success');
        this.isKilled = true;
      });
    }
  }
}

export default MainServer;

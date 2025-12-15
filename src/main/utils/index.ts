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

import { spawnSync } from 'child_process';
import compareVersions from 'compare-versions';
import detectPort from 'detect-port';
import { app, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { maxJDKVersion, minJDKReleaseVersion, minJDKVersion } from '../config';
import log from './log';

export function isODCSchemaUrl(url) {
  return /^odc:\/\//.test(url);
}

export function getParamsFromODCSchema(url: string) {
  return url.replace(/^odc:\/\//, '');
}

export async function getAvailablePort(): Promise<number> {
  if (process.env.ODC_PORT) {
    return parseInt(process.env.ODC_PORT);
  }
  let ports = [8989, 9989, 10089, 12089];
  let realPort;

  for (const port of ports) {
    /**
     * detectPort 会判断port-port+10的端口是否占用，都被占用会返回一个随机的端口，这个端口就容易命中客户的防火墙
     * 所以这边我们尽量让端口保留在一定区间
     */
    realPort = await detectPort(port);
    if (8989 <= realPort && 12089 >= realPort) {
      break;
    }
  }
  log.info(`**realport: ${realPort}**`);
  return realPort;
}

export async function checkJavaVersions(): Promise<boolean> {
  return new Promise((resolve) => {
    const java = getJavaPath();
    if (java) {
      log.info('发现内置 JRE ，跳过版本检查');
      resolve(true);
      return;
    }
    const { error, stdout, stderr } = spawnSync('java', ['-version']);
    if (error) {
      log.error(error);
      const id = dialog.showMessageBoxSync({
        type: 'error',
        buttons: ['继续启动', '关闭'],
        defaultId: 1,
        title: '检查Java环境失败',
        message: '检查Java环境失败',
        detail: '请确认Java是否正确安装',
        cancelId: 1,
      });
      if (id === 0) {
        resolve(true);
        return;
      }
      resolve(false);
      return;
    }
    log.info('Java Env:' + stderr.toString());
    const data = stderr.toString();
    let javaVersion = /(java|openjdk)\s+version\s+"([\w.]+)"/.exec(data)?.[2];
    log.info('javaVersion:' + javaVersion);
    log.info('minVersion:' + minJDKVersion);
    log.info('maxVersion:' + maxJDKVersion);
    if (javaVersion) {
      let javaReleaseVersion = parseInt(javaVersion.split('_')[1]) || 9999;
      javaVersion = javaVersion.split('_')[0];
      if (
        compareVersions(javaVersion, minJDKVersion) === -1 ||
        (javaVersion === minJDKVersion && minJDKReleaseVersion > javaReleaseVersion)
      ) {
        const id = dialog.showMessageBoxSync({
          type: 'error',
          buttons: ['继续启动', '关闭'],
          defaultId: 1,
          title: '检查Java环境失败',
          message: 'Java 版本过低',
          detail: `请安装${minJDKVersion}_${minJDKReleaseVersion}版本以上的Java`,
          cancelId: 1,
        });
        if (id === 0) {
          resolve(true);
          return;
        }
        resolve(false);
        return;
      } else if (compareVersions(javaVersion, maxJDKVersion) === 1) {
        const id = dialog.showMessageBoxSync({
          type: 'error',
          buttons: ['继续启动', '关闭'],
          defaultId: 1,
          title: '检查Java环境失败',
          message: 'Java 版本过高',
          detail: `请安装${maxJDKVersion}版本的Java`,
          cancelId: 1,
        });
        if (id === 0) {
          resolve(true);
          return;
        }
        resolve(false);
        return;
      }
      resolve(true);
    } else {
      log.info('JDK NOT FOUND');
      const id = dialog.showMessageBoxSync({
        type: 'error',
        buttons: ['继续启动', '关闭'],
        defaultId: 1,
        title: '检查Java环境失败',
        message: 'Java 未安装',
        detail: `请安装${minJDKVersion}版本以上的Java`,
        cancelId: 1,
      });
      if (id === 0) {
        resolve(true);
        return;
      }
      resolve(false);
    }
  });
}

export function getJavaDBFilePath() {
  let dbFolderPath = process.env.ODC_DB_PATH;
  if (process.env.ODC_DB_PATH) {
    dbFolderPath = process.env.ODC_DB_PATH;
  } else {
    dbFolderPath = app.getPath('userData');
  }
  const homeFiles = fs.readdirSync(dbFolderPath);
  /**
   * 旧DB迁移
   */
  let filesPath = [];
  for (let i = 0; i < homeFiles.length; i++) {
    const file = homeFiles[i];
    if (/odc[\w\.]+\.db/.test(file)) {
      const dbFilePath = path.join(dbFolderPath, file);
      log.info('db: ', dbFilePath);
      filesPath.push(dbFilePath);
    }
  }
  return filesPath;
}

export function getJavaDBPath() {
  if (process.env.ODC_DB_PATH) {
    return process.env.ODC_DB_PATH;
  }
  const userHome = app.getPath('home');
  const userDataPath = app.getPath('userData');
  const homeFiles = fs.readdirSync(userHome);
  /**
   * 旧DB迁移
   */
  homeFiles.forEach((file) => {
    if (/odc[\w\.]+\.db/.test(file)) {
      const oldPath = path.join(userHome, file);
      const newPath = path.join(userDataPath, file);
      log.info('存在旧的DB，自动迁移', oldPath, newPath);
      fs.renameSync(oldPath, newPath);
    }
  });
  return app.getPath('userData');
}

export function getJavaLogPath() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return path.join(process.cwd());
  }
  return path.join(app.getPath('userData'), 'logs/server');
}

export function getJavaPath() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';
  let basePath = path.join(
    isDevelopment ? process.cwd() : process.resourcesPath || '',
    'libraries/jre',
  );
  if (!fs.existsSync(basePath)) {
    log.info(basePath, ' 检测不到 Jre，采用系统 Jre');
    return null;
  }
  return {
    JAVA_HOME: basePath,
    javaBin:
      isMac || isLinux ? path.join(basePath, '/bin/java') : path.join(basePath, '/bin/java.exe'),
    jspawnhelper:
      isMac || isLinux
        ? path.join(basePath, '/lib/jspawnhelper')
        : path.join(basePath, '/lib/jspawnhelper.exe'),
  };
}

export function getSettingPath() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  let basePath = isDevelopment
    ? path.join(process.cwd(), 'build/setting.json')
    : path.join(process.resourcesPath || '', 'setting.json');
  return basePath;
}

export function getUserSettingPath() {
  return path.join(app.getPath('userData'), 'userSetting.json');
}

export function getSetting(): Record<string, string> {
  const userSettingPath = getUserSettingPath();
  let file = '';
  if (fs.existsSync(userSettingPath)) {
    // 先从用户数据目录里拿
    file = fs.readFileSync(userSettingPath, 'utf-8').toString();
  } else {
    // 拿不到就拿默认值
    let basePath = getSettingPath();
    if (!fs.existsSync(basePath)) {
      return null;
    }
    file = fs.readFileSync(basePath, 'utf-8').toString();
  }
  try {
    return JSON.parse(file);
  } catch (e) {
    return null;
  }
}

export function getH2JarPath() {
  let odcJarPath: string;
  if (process.env.NODE_ENV === 'development') {
    odcJarPath = path.join(process.cwd(), 'libraries', 'script');
  } else {
    odcJarPath = path.join(process.resourcesPath || '', 'libraries', 'script');
  }
  return {
    v1: path.join(odcJarPath, 'h2-v1.jar'),
    v2: path.join(odcJarPath, 'h2-v2.jar'),
  };
}

export function getRendererPath() {
  const p = 'file:' + path.join(process.resourcesPath, 'renderer/');
  log.info('renderer path: ', p);
  return p;
}

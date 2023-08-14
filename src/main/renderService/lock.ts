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

import crypto from 'crypto';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import MainServer from '../server/main';
import { getJavaDBFilePath } from '../utils';
import log from '../utils/log';

const secret = Buffer.from('KCj7tMS33mSnjRQu9WSvgPPtViEffoYOnlVVzxOL4JQ=', 'base64');

const pwdFile = path.join(app.getPath('userData'), 'BYPZGDX');

const processLockKey = ~~(Math.random() * 100000);

// 加密
function aesEncrypt(data) {
  if (!data) {
    return '';
  }
  let cipher = crypto.createCipheriv('aes-256-cbc', secret, Buffer.alloc(16, 0));
  cipher.update(data, 'utf8', 'hex');
  return cipher.final('hex');
}

// 解码
function aesDecrypt(encrypt) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', secret, Buffer.alloc(16, 0));
  decipher.update(encrypt, 'hex', 'utf8');
  return decipher.final('utf8');
}

function getLocalEncryptPwd() {
  if (fs.existsSync(pwdFile)) {
    return fs.readFileSync(pwdFile).toString();
  } else {
    return '';
  }
}

function checkPwd(pwd: string = '') {
  const oldEncryptPwd = getLocalEncryptPwd() || '';
  return aesEncrypt(pwd) == oldEncryptPwd ? processLockKey : null;
}

function checkProcessKey(processKey) {
  return processKey == processLockKey;
}

function changePwd(originPwd: string, pwd: string) {
  if (!checkPwd(originPwd)) {
    return null;
  }
  let encryptPwd = aesEncrypt(pwd);
  fs.writeFileSync(pwdFile, encryptPwd);
  return processLockKey;
}

async function resetPwdAndDB() {
  const dbPath = getJavaDBFilePath();
  if (!dbPath.length) {
    return false;
  }
  log.info('db：', dbPath);
  await MainServer.getInstance().stopServer(true);
  dbPath.forEach((filePath) => fs.unlinkSync(filePath));
  fs.unlinkSync(pwdFile);
  return true;
}

export { aesEncrypt, aesDecrypt, checkPwd, changePwd, resetPwdAndDB, checkProcessKey };

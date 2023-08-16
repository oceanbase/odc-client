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

const { download } = require('./util');
const AdmZip = require('adm-zip');
const execSync = require('child_process').execSync
const fs = require('fs');
const path = require('path');

const platform = process.env.platform || 'mac';

const baseUrl = "https://obodc-front.oss-cn-beijing.aliyuncs.com/";

exports.run = async function () {
  console.log('开始下载 Jre');
  const jrePath = path.resolve(process.cwd(), 'libraries/jre');
  if (fs.existsSync(jrePath)) {
    fs.rmSync(jrePath, { recursive: true, force: true });
  }
  const isSuccess = await download(
    baseUrl + `library/jre/${platform}/jre.zip`,
    'libraries/jre',
    'jre.zip',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const jreZipPath = path.resolve(process.cwd(), 'libraries/jre/jre.zip');
  var zip = new AdmZip(jreZipPath);
  zip.extractAllTo(path.resolve(process.cwd(), 'libraries/jre/'), true);
  if (platform.includes('linux')) {
    execSync('chmod -R a+x ' + path.resolve(process.cwd(), 'libraries/jre/'), {
      stdio: 'inherit'
    })
  }
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(jreZipPath);
  console.log(jreZipPath, '删除完成');
};

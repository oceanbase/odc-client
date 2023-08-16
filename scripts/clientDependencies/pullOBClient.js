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
const tar = require('tar');
const fs = require('fs');
const path = require('path');

const urlMap = {
  'linux_x86': `library/obclient/1_2_8/x86/obclient.tar.gz`,
  'win64': `library/obclient/1_2_8/windows/obclient.tar.gz`,
  'linux_aarch64': `library/obclient/1_2_8/aarch/obclient.tar.gz`,
}

const baseUrl = "https://obodc-front.oss-cn-beijing.aliyuncs.com/";

exports.run = async function () {
  const uri = urlMap[process.env.platform];
  if (!uri) {
    console.log('obclient not found, skip');
    return;
  }
  console.log('开始下载 OBClient');
  const isSuccess = await download(
    baseUrl + uri,
    'libraries',
    'obclient.tar.gz',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const tarPath = path.resolve(process.cwd(), 'libraries/obclient.tar.gz');
  await tar.x({
    file: tarPath,
    cwd: path.resolve(process.cwd(), 'libraries'),
    filter: (filePath) => {
      const fileName = path.basename(filePath);
      if (fileName.indexOf('.') === 0) {
        return false
      }
      return true;
    }
  });
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(tarPath);
  console.log(tarPath, '删除完成');
};


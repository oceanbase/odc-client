/*
 * Copyright 2024 OceanBase
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

const { download } = require('./clientDependencies/util');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const run = async function () {
  console.log('开始下载文档包');
  const isSuccess = await download(
    `https://obodc-front.oss-cn-beijing.aliyuncs.com/docs/${pkg.version}/doc.zip`,
    'public/help-doc',
    'doc.zip',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const zipPath = path.resolve(process.cwd(), 'public/help-doc/doc.zip');
  var zip = new AdmZip(zipPath);
  zip.extractAllTo(path.resolve(process.cwd(), 'public/help-doc/'), true);
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(zipPath);
  console.log(zipPath, '删除完成');
};

run()

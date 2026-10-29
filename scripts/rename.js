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
 * 把假的文件先删除，然后创建一个link到hidden.yaml文件
 */


const path = require('path');
const fs = require('fs');

// 参数 preinstall 和 postinstall
// preinstall 代表install
// postinstall 代表install完成之后

const lockFilePath = path.join(process.cwd(), 'hidden.yaml');

const fakeLockFilePath = path.join(process.cwd(), 'pnpm-lock.yaml');
console.log('init install lock file')

if (fs.existsSync(fakeLockFilePath)) {
    fs.unlinkSync(fakeLockFilePath);
}

fs.symlinkSync(lockFilePath, fakeLockFilePath, 'file');




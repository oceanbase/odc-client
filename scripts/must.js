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

const must = require('@oceanbase-odc/ob-intl-cli');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const pkg = require('../package.json');
const cpx = require('cpx').copySync;

const baseDir = path.join(__dirname, '..');

const localePath = path.join(baseDir, 'src/locales');

const outputPath = path.join(localePath, './must');

const exclude = 'src/main';

const languages = ['en-US', 'zh-CN'];

function matchText(text, path) {
  const isConsoleLog = /^console\.log\(/gi.test(path?.parentPath?.toString());
  let isFormattedMessage = false;
  // 识别 <FormatMessage> 标签的文字层级
  try {
    isFormattedMessage = /^\<FormattedMessage/g.test(
      path.parentPath.parentPath.parentPath.parentPath.parentPath.toString(),
    );
  } catch (e) {}
  return /[^\x00-\xff]/.test(text) 
  // && !isConsoleLog && !isFormattedMessage; // ^\x00-\xff 表示匹配中文字符
}

const config = {
  cwd: baseDir,
  name: pkg.name,
  entry: 'src',
  fileType: 'ts',
  sourceLang: 'zh-CN',
  prettier: true,
  exclude: (path) => {
    return (
      path.includes('src/.umi') ||
      path.includes('src/locales') ||
      (!!exclude && path.includes(exclude))
    ); // 不处理 .umi 下的文件
  },
  matchCopy: matchText,
  macro: {
    path: outputPath,
    method: `formatMessage({id: '$key$'})`,
    import: "import { formatMessage } from '@/util/intl';\n",
    showComment: true,
  },
  hook: {
    beforeExtract: (sourceAST, absoluteFilePath, config) => {
      if (absoluteFilePath.indexOf('/store/task') > -1) {
        console.log(sourceAST); // 当前文件的 AST
        console.log(absoluteFilePath); // 文件路径
        console.log(config); // must 配置
      }
      return sourceAST; // 必须返回新的 AST
    },
    afterExtract: (injectedAST, keyMap, absoluteFilePath, config) => {
      if (absoluteFilePath.indexOf('/store/test') > -1) {
        console.log(injectedAST); // 当前文件的 AST
        console.log(keyMap); // 提取的文案列表
        console.log(absoluteFilePath); // 文件路径
        console.log(config); // must 配置
      }
      return injectedAST; // 返回修改后的 AST
    },
  },
};

const mode = process.argv[2];

async function run() {
  await must.run(config, true);
  // languages.forEach((language) => {
  //   const jsonPath = path.join(outputPath, 'strings', language + '.json');
  //   if (fs.existsSync(jsonPath)) {
  //     cpx(jsonPath, localePath);
  //   }
  // });
  // fs.unlinkSync(path.join(outputPath, 'index.ts'));
  // fs.unlinkSync(path.join(outputPath, 'strings/index.d.ts'));
  // fs.unlinkSync(path.join(outputPath, 'strings/index.js'));
}

async function online() {
  await must.import.run({
    type: 'json',
    path: outputPath,
    medusa: {
      appName: 'odc',
    },
  });
  medusaCheck();
}

function medusaCheck() {
  const baseline = path.join(outputPath, 'strings', 'zh-CN.json');
  const validTargets = [
    path.join(outputPath, 'strings', 'en-US.json'),
    path.join(outputPath, 'strings', 'zh-TW.json'),
  ];
  try {
    function getAllKeyRow(data) {
      Object.keys(data).map((key) => {
        const value = data[key];
        if (!value.match) {
          console.log('empty value ', value, '-', key);
        }
        const params = value.match(/\{[^}\s]+\}/g);
        if (params && params.length) {
          data[key] = {
            params,
            value,
          };
        } else {
          delete data[key];
        }
      });
      return data;
    }
    const baselineData = getAllKeyRow(JSON.parse(fs.readFileSync(baseline).toString()));
    validTargets.forEach((targetPath) => {
      const targetData = getAllKeyRow(JSON.parse(fs.readFileSync(targetPath).toString()));
      const baselineKeys = Object.keys(baselineData);
      const targetKeys = Object.keys(targetData);
      if (baselineKeys.length !== targetKeys.length) {
        console.error(
          `[error] 词条总量不一致, ${targetPath}\n count: ${targetPath.length} expect: ${baselineKeys.length}`,
        );
      }
      baselineKeys.forEach((baselineKey) => {
        const { params, value } = baselineData[baselineKey] || {};
        const { params: targetParams, value: targetValue } = targetData[baselineKey] || {};
        if (!_.isEqual(params?.sort(), targetParams?.sort())) {
          console.error(
            `[error] ${targetPath} \n词条参数不一致 ${baselineKey} \n src: ${targetValue} \n zh-CN: ${value}`,
          );
        }
      });
    });
  } catch (e) {
    console.error('解析错误', e);
    process.exit(1);
  }
}

if (mode === 'online') {
  online();
} else if (mode === 'check') {
  medusaCheck();
} else if (mode) {
  console.error(`${mode} is invalid`)
  process.exit(1);
} else {
  run();
}
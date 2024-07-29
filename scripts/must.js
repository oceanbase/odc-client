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

const path = require('path');
const pkg = require('../package.json');

const baseDir = path.join(__dirname, '..');

const localePath = path.join(baseDir, 'src/locales');

const outputPath = path.join(localePath, './must/strings');

const exclude = 'src/main';

function matchText(text, path) {
  const isConsoleLog = /^console\.log\(/gi.test(path?.parentPath?.toString());
  let isFormattedMessage = false;
  // 识别 <FormatMessage> 标签的文字层级
  try {
    isFormattedMessage = /^\<FormattedMessage/g.test(
      path.parentPath.parentPath.parentPath.parentPath.parentPath.toString(),
    );
  } catch (e) {}
  return /[\u{4E00}-\u{9FFF}]+(?![\u3000-\u303F\uFF01-\uFF5E])/gumi.test(text) && !isConsoleLog;
}
const config = {
  name: pkg.name,
  entry: 'src',
  output: outputPath,
  sep: '.',
  exclude: (path) => {
    return (
      path.includes('src/.umi') ||
      path.includes('src/locales') ||
      (!!exclude && path.includes(exclude))
    ); // 不处理 .umi 下的文件
  },
  sourceLang: 'zh-CN',
  targetLang: 'en-US',
  /** @description 执行clear命令时需要清除的冗余文案的语言类型，当该属性为空数组或缺失该属性时，将会把sourceLang作为执行clear命令的参数。 */
  clearLangs: ['zh-CN', 'en-US', 'zh-TW'],
  matchFunc: matchText,
  injectContent: {
    import: "import { formatMessage } from '@/util/intl';\n",
    method: `formatMessage({id: '$key$' })`,
    withDefaultMessage: true,
  },
  migrateConfig: {
    defaultMessage: true,
    parametersShortHand: true,
  },
};

module.exports = config;

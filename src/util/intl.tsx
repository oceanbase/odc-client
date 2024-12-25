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

// TODO: 现在需要手动安装 react-intl，但可能与 umi 内置的版本冲突。因此后续需要等 umi 支持导出 createIntl，再从 umi 中引入，这样能避免版本冲突的问题。
// 已给 umi 提 issue: https://github.com/umijs/plugins/issues/400
import odc from '@/plugins/odc';
import { IntlShape, createIntl } from 'react-intl';
export const defaultLocale = 'en-us';

let intl;
/**
 * umi4  中插件会在render内初始化，这会导致ODC很多render之前涉及到插件调用的方法报错，所以需要特殊处理这部分的逻辑
 */
function getLocale() {
  const lang =
    navigator.cookieEnabled && typeof localStorage !== 'undefined'
      ? window.localStorage.getItem('umi_locale')
      : '';
  // support baseNavigator, default true
  let browserLang;
  const isNavigatorLanguageValid =
    typeof navigator !== 'undefined' && typeof navigator.language === 'string';
  browserLang = isNavigatorLanguageValid ? navigator.language.split('-').join('-') : '';
  return lang || browserLang || 'en-US';
}

function getEnvLocale() {
  console.log('plugin', odc.appConfig.locale.getLocale());
  if (odc.appConfig.locale.getLocale) {
    return odc.appConfig.locale.getLocale();
  }

  return getLocale();
}

export function getLocalImg(fileName) {
  let local: string = getEnvLocale();
  local = local.toLowerCase();
  const existLocal = ['en-us', 'zh-cn', 'zh-tw'];
  if (!existLocal.includes(local)) {
    local = defaultLocale;
  }
  //@ts-ignore
  return window.publicPath + `img/${local}/${fileName}`;
}

export function getLocalDocs(hash?: string) {
  let local: string = getEnvLocale();
  local = local.toLowerCase();
  const existLocal = ['en-us', 'zh-cn'];
  if (!existLocal.includes(local)) {
    local = defaultLocale;
  }
  return window.publicPath + 'help-doc/' + local + '/index.html' + (hash ? `#/${hash}` : '');
}

export async function initIntl() {
  let locale: string = getEnvLocale();
  let messages: Record<string, string> = {};
  switch (locale) {
    case 'zh-CN': {
      messages = (await import('@/locales/must/strings/zh-CN.json')).default;
      break;
    }
    case 'zh-TW': {
      messages = (await import('@/locales/must/strings/zh-TW.json')).default;
      break;
    }
    case 'zh-HK': {
      messages = (await import('@/locales/must/strings/zh-TW.json')).default;
      break;
    }
    case 'en-US':
    default: {
      messages = (await import('@/locales/must/strings/en-US.json')).default;
      break;
    }
  }
  intl = createIntl({
    locale,
    messages,
  });
  return true;
}
export function formatMessage(...args) {
  return intl?.formatMessage(...args);
}

export default function getIntl(): IntlShape {
  return intl;
}

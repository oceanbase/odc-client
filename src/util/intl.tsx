// TODO: 现在需要手动安装 react-intl，但可能与 umi 内置的版本冲突。因此后续需要等 umi 支持导出 createIntl，再从 umi 中引入，这样能避免版本冲突的问题。
// 已给 umi 提 issue: https://github.com/umijs/plugins/issues/400
import en_US from '@/locales/en-US';
import zh_CN from '@/locales/zh-CN';
import zh_TW from '@/locales/zh-TW';
import odc from '@/plugins/odc';
import { createIntl } from 'react-intl';
export const defaultLocale = 'en-us';

const messages = {
  'en-us': en_US,
  'zh-cn': zh_CN,
  'zh-tw': zh_TW,
  zh_hk: zh_TW,
};

let locale: string = getEnvLocale();
let lowerCaseLocale = locale.toLowerCase();
if (!messages[lowerCaseLocale]) {
  lowerCaseLocale = defaultLocale;
}
let intl = createIntl({
  locale,
  messages: messages[lowerCaseLocale],
});

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

export function getLocalTemplate(fileName) {
  let local: string = getEnvLocale();
  local = local.toLowerCase();
  const existLocal = ['en-us', 'zh-cn', 'zh-tw'];
  if (!existLocal.includes(local)) {
    local = defaultLocale;
  }
  //@ts-ignore
  return window.publicPath + `template/${local}/${fileName}`;
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

export const { formatMessage } = intl;
export default intl;

export const supportLanguage = Object.keys(messages);

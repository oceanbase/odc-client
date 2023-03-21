import type { IManagerUser } from '@/d.ts';
import Cookies from 'js-cookie';

function hideAliyunHeader() {
  const aliyunHeader = document.querySelector('[data-spm="console-base"]');
  const aliyunHeader2 = document.getElementById('topbarAndsidebarContainer');

  // 进入 ODC 工作台，需要隐藏顶部 consoleBase 导航头
  document.body.setAttribute('style', 'padding-top:0 !important;padding-left:0 !important;');
  [aliyunHeader, aliyunHeader2].forEach((h) => {
    if (h) {
      h.setAttribute('style', 'display:none;');
    }
  });
}

function showAliyunHeader() {
  const aliyunHeader = document.querySelector('[data-spm="console-base"]');
  const aliyunHeader2 = document.getElementById('topbarAndsidebarContainer');
  document.body.setAttribute('style', '');
  [aliyunHeader, aliyunHeader2].forEach((h) => {
    if (h) {
      h.setAttribute('style', 'display:block;');
    }
  });
}

function isCloudWeb(): boolean {
  return ENV_target === 'web' && ENV_environment === 'cloud';
}

// 多云环境
function isOBCloud(): boolean {
  return window.currentEnv === 'obcloud';
}

const ALIYUN_LANG = {
  en: 'en-US', // 英语
  zh: 'zh-CN', // 汉语
  ja: 'ja-JP', // 日语
  'zh-TW': 'zh-TW', // 繁体中文
  'zh-HK': 'zh-HK', // 繁体中文香港
};
const ALIYUN_LANG_COOKIE_KEY = 'aliyun_lang';
const ALIYUN_DEFAULT_LOCALE = 'zh-cn';

export default {
  login: {
    menu: !isCloudWeb(),
  },
  locale: {
    menu: !isCloudWeb(),
    getLocale: isCloudWeb()
      ? () => {
          if (process.env.NODE_ENV == 'test') {
            return ALIYUN_DEFAULT_LOCALE;
          }
          if (isCloudWeb()) {
            const lang = Cookies.get(ALIYUN_LANG_COOKIE_KEY);
            if (lang && ALIYUN_LANG[lang]) {
              return ALIYUN_LANG[lang];
            }
            return ALIYUN_DEFAULT_LOCALE;
          }
        }
      : null,
  },
  docs: {
    url: isCloudWeb() ? 'https://help.aliyun.com/document_detail/154955.html' : null,
  },
  worker: {
    needOrigin: !isCloudWeb(),
  },
  debug: {
    enable: !isCloudWeb(),
  },
  manage: {
    user: {
      create: !isCloudWeb(),
      resetPwd: !isCloudWeb(),
      delete: !isCloudWeb(),
      isAdmin: (user: IManagerUser) => {
        return isCloudWeb()
          ? user?.name?.startsWith('CUSTOMER_PUBLIC_CLOUD_')
          : user?.builtIn && user?.accountName === 'admin';
      },
      tabInVisible: (setting) => {
        return setting.serverSystemInfo?.profiles.includes('privateAliyun');
      },
    },
    record: {
      enable: (setting) => {
        return !setting.serverSystemInfo?.profiles.includes('privateAliyun');
      },
    },
    showRAMAlert: (setting) => {
      return setting.serverSystemInfo?.profiles.includes('privateAliyun');
    },
  },
  connection: {
    sys: !isCloudWeb(),
  },
  task: {
    sys: !isOBCloud(),
  },
  systemConfig: {
    default: isCloudWeb()
      ? {
          buildTime: 11,
          startTime: 22,
          version: '2.1',
        }
      : null,
  },
  spm: {
    enable: !isCloudWeb(),
  },
  workspace: {
    preMount() {
      hideAliyunHeader();
    },
    unMount() {
      showAliyunHeader();
    },
  },
};

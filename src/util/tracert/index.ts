import { PageType } from '@/d.ts';
import { hasEventTrackingPermission, isClient } from '@/util/env';

import pkg from '../../../package.json';

export function initTracert() {
  //@ts-ignore
  window._to = {
    spmAPos: 'a3112',
    bizType: 'lu',
    type: 'manual',
    ifInjectManualScript: false,
    ifRouterNeedPv: true,
    autoLogPv: false,
    eventType: null,
    mdata: {
      version: pkg.version,
    },
    roleId: null,
    debug: process?.env?.NODE_ENV === 'development',
  };
  const dom = document.createElement('script');
  dom.setAttribute('src', 'https://ur.alipay.com/tracert_a3112.js');
  document.head.appendChild(dom);
}

function getTracert() {
  // 如果不是桌面端，正常开启埋点。
  if (!isClient()) {
    return window.Tracert;
  }
  // 桌面端在获得了用户信息采集许可后才开启埋点。
  if (isClient() && hasEventTrackingPermission()) {
    return window.Tracert;
  }
  return undefined;
}

const pageSpm = {
  [PageType.TABLE]: 'c114254',
  [PageType.RECYCLE_BIN]: 'c114253',
  [PageType.TUTORIAL]: 'c114252',
  [PageType.SQL]: 'c114261',
  [PageType.SESSION_MANAGEMENT]: 'c114255',
};
const tracert = {
  updateTracertParams(newParams: Record<string, any>) {
    const ins = getTracert();
    if (ins) {
      ins.call('set', newParams);
    }
  },
  setUser(id) {
    tracert.updateTracertParams({
      roleId: id,
    });
  },
  expo(id) {
    const ins = getTracert();
    if (ins) {
      ins.expo(id, 'up', {}, { force: true });
    }
  },
  expoPage(pageType) {
    const spm = pageSpm[pageType];
    if (spm) {
      tracert.expo(spm);
    }
  },
};
export default tracert;

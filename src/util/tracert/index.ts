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
  expo(id, data?: Record<any, any>) {
    const ins = getTracert();
    if (ins) {
      ins.expo(id, 'up', data || {}, { force: true });
    }
  },
  click(id, data?: Record<any, any>) {
    const ins = getTracert();
    if (ins) {
      ins.click(id, data || {});
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

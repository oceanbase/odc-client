/**
 * page存储相关
 */

import { getMetaStoreInstance } from '@/common/metaStore';
import { tabExpiredTime } from '@/constant';
import login from '@/store/login';
import commonStore from '../../common';

/**
 * 获取当前页面存储的唯一值
 */
function getTabUniqKey() {
  return commonStore.tabKey;
}

/**
 * 保存pages信息
 */
export async function savePageStoreToMetaStore(pages, activeKey) {
  const oldData = (await getMetaStoreInstance().getItem(getTabUniqKey())) || {};
  await getMetaStoreInstance().setItem(getTabUniqKey(), {
    ...oldData,
    pages,
    activeKey,
    userId: login.user?.id,
  });
}

/**
 * 保存pageKeys信息
 */
export async function savePageKeysToMetaStore(pageKey, plPageKey, plDebugPageKey) {
  const oldData = (await getMetaStoreInstance().getItem(getTabUniqKey())) || {};
  await getMetaStoreInstance().setItem(getTabUniqKey(), {
    ...oldData,
    pageKey,
    plPageKey,
    plDebugPageKey,
  });
}
/**
 * 把sessionId和dbName保存在store中
 */
export async function saveSessionToMetaStore(sessionId, sessionName, databaseName) {
  const oldData = (await getMetaStoreInstance().getItem(getTabUniqKey())) || {};
  await getMetaStoreInstance().setItem(getTabUniqKey(), {
    initDate: Date.now(),
    ...oldData,
    sessionId,
    databaseName,
    sessionName,
  });
}
/**
 * 清除pages信息
 */
export function clearTabDataInMetaStore() {
  getMetaStoreInstance().removeItem(getTabUniqKey());
}

export function getTabDataFromMetaStore() {
  return getMetaStoreInstance().getItem(getTabUniqKey());
}

/**
 * 这边的作用就是清除过期的pages信息。
 * pages只在自己的tab上有效
 */
let _uniqExpiredClockKey;
export async function initPageExpiredWork() {
  if (_uniqExpiredClockKey) {
    clearTimeout(_uniqExpiredClockKey);
    _uniqExpiredClockKey = null;
  }
  const EXPIRED_Map_KEY = 'expiredMap';
  const expiredMap = (await getMetaStoreInstance().getItem(EXPIRED_Map_KEY)) || {};
  const tabKeys = Object.keys(expiredMap);
  const now = Date.now();
  /**
   * 清除过期的数据
   */
  for (let tabKey of tabKeys) {
    const { expiredTime } = expiredMap[tabKey];
    if (now > expiredTime) {
      await getMetaStoreInstance().removeItem(tabKey);
      delete expiredMap[tabKey];
    }
  }
  await getMetaStoreInstance().setItem(EXPIRED_Map_KEY, expiredMap);

  /**
   * 设置自动刷新过期时间
   */
  async function run() {
    const expiredMap = (await getMetaStoreInstance().getItem(EXPIRED_Map_KEY)) || {};
    const session = expiredMap[getTabUniqKey()] || {};
    /**
     * 有效期
     */
    session.expiredTime = Date.now() + tabExpiredTime;
    expiredMap[getTabUniqKey()] = session;
    await getMetaStoreInstance().setItem(EXPIRED_Map_KEY, expiredMap);
    _uniqExpiredClockKey = setTimeout(() => {
      run();
    }, tabExpiredTime / 48);
  }
  run();
}

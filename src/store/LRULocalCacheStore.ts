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

import { action, observable, runInAction } from 'mobx';
import { safeParseJson } from '@/util/utils';
import { isArray } from 'lodash';
import { UserStore } from '@/store/login';

export enum PERSISTENCE_KEY {
  /** 作业-作业视角参数缓存 */
  SCHEDULE_PARAMS_PERSISTENCE_LOCALKEY = 'schedule_params_persistence_localkey',
  /** 作业-执行视角参数缓存 */
  SCHEDULETASK_PARAMS_PERSISTENCE_LOCALKEY = 'scheduletask_params_persistence_localkey',
  /** 工单-工单视角参数缓存 */
  TASK_PARAMS_PERSISTENCE_LOCALKEY = 'task_params_persistence_localkey',
}

export class LRULocalStorageCacheStore {
  private static getCache(localKey: string): { key: string; value: any }[] {
    return safeParseJson(localStorage.getItem(localKey));
  }

  @observable private capacity: { [key in PERSISTENCE_KEY]: number };

  private static setCache(localKey: string, value: any) {
    localStorage.setItem(localKey, value);
  }

  constructor(capacity: { [key in PERSISTENCE_KEY]: number }) {
    runInAction(() => {
      this.capacity = capacity;
    });
  }

  private getCapacityByLocalKey(localKey: string) {
    return this.capacity?.[localKey] || 50;
  }

  private getKeyByCurrentUser(userStore: UserStore) {
    if (!userStore?.user?.id) {
      return undefined;
    }
    return `${userStore?.user?.id}_${userStore?.user?.accountName}_${
      userStore?.isPrivateSpace() ? 'privateSpace' : 'publicSpace'
    }`;
  }

  /** 获取缓存值 */
  public getCacheValue<T>(localKey: string, userStore: UserStore): T | undefined {
    const cache = LRULocalStorageCacheStore.getCache(localKey) || [];
    const key = this.getKeyByCurrentUser(userStore);
    if (isArray(cache)) {
      const currentIndex = cache?.findIndex((item) => item?.key === key);
      if (currentIndex === -1) {
        return undefined;
      }
      const currentItem = cache?.[currentIndex];
      cache?.splice(currentIndex, 1);
      cache?.push(currentItem);

      LRULocalStorageCacheStore.setCache(localKey, this.serialization(cache));
      return safeParseJson(currentItem?.value);
    }
    return undefined;
  }

  /** 设置缓存值 */
  public setCacheValue(localKey: string, userStore: UserStore, value: any) {
    const cache = LRULocalStorageCacheStore.getCache(localKey) || [];
    const key = this.getKeyByCurrentUser(userStore);
    if (isArray(cache) && key) {
      const currentIndex = cache?.findIndex((item) => item?.key === key);
      if (currentIndex !== -1) {
        cache?.splice(currentIndex, 1);
      }
      cache?.push({ key, value });
      if (cache?.length > this.getCapacityByLocalKey(localKey)) {
        cache?.shift();
      }
      LRULocalStorageCacheStore.setCache(localKey, this.serialization(cache));
    }
  }

  public serialization(data: Record<any, any>) {
    return JSON.stringify(data);
  }
}

export default new LRULocalStorageCacheStore({
  [PERSISTENCE_KEY.SCHEDULE_PARAMS_PERSISTENCE_LOCALKEY]: 50,
  [PERSISTENCE_KEY.SCHEDULETASK_PARAMS_PERSISTENCE_LOCALKEY]: 50,
  [PERSISTENCE_KEY.TASK_PARAMS_PERSISTENCE_LOCALKEY]: 50,
});

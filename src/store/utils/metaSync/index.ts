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

import { getMetaStoreInstance } from '@/common/metaStore';
import login from '@/store/login';
import logger from '@/util/logger';
import { history } from '@umijs/max';
import { isNil, throttle } from 'lodash';
import { IReactionDisposer, reaction } from 'mobx';

function getOrganizationKey() {
  const userId = login?.user?.id;
  const organizationId = login?.organizationId;
  const tabKey = /sqlworkspace\/(.+)/.exec(history.location.pathname)?.[1] || '';
  const key = tabKey
    ? `tmp-${tabKey}-${userId}-organization-${organizationId}`
    : `${userId}-organization-${organizationId}`;
  return organizationId ? key : null;
}

/**
 * 更新数据的缓存，用来批量更新数据提高性能，同时避免异步读写导致的数据覆盖问题。
 */
const modifyCache = new Map<string, any>();

let isSaving = false;
let saveRequestCount = 0;

const saveToDB = throttle(async function () {
  console.log('save to db');

  if (isSaving) {
    saveRequestCount++;
    console.warn('db is saving');
    return;
  }
  isSaving = true;
  try {
    for (let [key, value] of modifyCache.entries()) {
      /**
       * 这里需要提前删除，假如异步删除，会导致updateDB执行之后，还未save的情况下，cache就被删了。
       */
      modifyCache.delete(key);
      const oldData = (await getMetaStoreInstance().getItem(key)) || {};
      await getMetaStoreInstance().setItem(key, {
        ...oldData,
        ...value,
      });
      console.log('over', key);
    }
  } catch (e) {
    console.error(e);
  } finally {
    isSaving = false;
    console.log('save done');
  }
  if (saveRequestCount > 0) {
    console.log('continue save');
    saveRequestCount = 0;
    saveToDB();
  }
}, 500);

async function updateDB(key, value, propertyDBKey) {
  let cacheValue = modifyCache.get(key);
  if (!cacheValue) {
    cacheValue = {};
  }
  cacheValue = {
    ...cacheValue,
    [propertyDBKey]: value,
  };
  logger.debug(JSON.stringify(cacheValue, null, 4), key);
  modifyCache.set(key, cacheValue);
  saveToDB();
}

export async function autoSave(
  obj: any,
  property: string,
  propertyDBKey: string,
  defaultValue: any,
): Promise<() => void> {
  let timer;
  let mobxDisposer: IReactionDisposer;
  function saveDisposer() {
    console.log('dispose');
    mobxDisposer?.();
    mobxDisposer = null;
  }
  async function reset() {
    console.log('register meta sync');
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (mobxDisposer) {
      mobxDisposer();
      mobxDisposer = null;
    }
    /**
     * 先同步db到内存中
     */
    const key = getOrganizationKey();
    let data: any = defaultValue;
    if (!key) {
      /**
       * 组织不存在的情况下，无法定位到db，停止同步。
       */
      obj[property] = data;
      return;
    }
    const dbValue = (await (await getMetaStoreInstance()).getItem(key))?.[propertyDBKey];
    if (isNil(dbValue)) {
      data = defaultValue;
    } else {
      data = dbValue;
    }
    obj[property] = data;

    /**
     * 同步完成之后，监听数据的变化，数据变化之后，执行更新逻辑
     */
    console.log('add reaction');
    mobxDisposer = reaction(
      () => obj[property],
      () => {
        updateDB(key, obj[property], propertyDBKey);
      },
    );
    return;
  }

  await reset();
  return saveDisposer;
}

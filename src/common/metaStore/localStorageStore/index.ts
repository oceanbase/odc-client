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

import store from 'store';
import expirePlugin from 'store/plugins/expire';
import { IMetaStore } from '..';

store.addPlugin(expirePlugin);

export default class LocalStorageStore implements IMetaStore {
  async setItem(key: string, item: any): Promise<boolean> {
    store.set(key, item);
    return true;
  }
  async getItem(key: string): Promise<any> {
    store.removeExpiredKeys();
    return store.get(key);
  }
  async removeItem(key: string): Promise<boolean> {
    store.remove(key);
    return true;
  }
  async clear(): Promise<boolean> {
    store.each((v, key) => {
      if (['umi_locale'].includes(key)) {
        return;
      }
      this.removeItem(key);
    });
    return true;
  }
  async getAllItem(): Promise<any[]> {
    const arr = [];
    store.each((value, key) => {
      arr.push([key, value]);
    });
    return arr;
  }
}

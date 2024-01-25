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

import { batchTest } from '@/common/network/connection';
import { IConnectionStatus } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { generateUniqKey } from '@/util/utils';
import { action, observable, runInAction } from 'mobx';

const INTERVAL_TIME = 2000;
export class DataSourceStatusStore {
  @observable.shallow
  public statusMap: Map<
    IDatasource['id'],
    {
      errorCode: string;
      errorMessage: string;
      status: any;
      type: any;
    }
  > = new Map();

  private queue: Set<IDatasource['id']> = new Set();

  private _timer: any = null;

  private status: 'running' | 'stop' = 'stop';

  private async fetchStatus() {
    if (!this.queue.size || this.status === 'stop') {
      this.status = 'stop';
      return;
    }
    const data = await batchTest(Array.from(this.queue));
    if (!data) {
      this.status = 'stop';
      return;
    }
    runInAction(() => {
      Object.entries(data).forEach(([key, value]) => {
        const id = parseInt(key);
        this.statusMap.set(id, value);
        if (value.status !== IConnectionStatus.TESTING) {
          this.queue.delete(id);
        }
        this.statusMap = new Map(this.statusMap);
      });
    });
    if (this.queue.size) {
      this._timer = setTimeout(() => {
        this.fetchStatus();
      }, INTERVAL_TIME);
    } else {
      this.status = 'stop';
    }
  }

  public asyncUpdateStatus(ids: IDatasource['id'][]) {
    ids?.forEach((id) => {
      this.queue.add(id);
    });
    if (this.status === 'stop') {
      this.status = 'running';
      this.fetchStatus();
    }
  }

  public reset() {
    this.status = 'stop';
    this.statusMap = new Map();
    this.queue = new Set();
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = null;
  }

  public refresh() {
    const ids = Array.from(this.statusMap.keys());
    this.asyncUpdateStatus(ids);
  }
}

export default new DataSourceStatusStore();

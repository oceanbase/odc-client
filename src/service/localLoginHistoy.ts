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

import login from '@/store/login';
import { safeParseJson } from '@/util/utils';

import pkg from '../../package.json';

const currentVersion = pkg.version;

interface LocalLoginHistoryData {
  version: string;
}

class localLoginHistory {
  private getKey() {
    return login.user?.id + '-localHistory';
  }
  private getMetaData(): LocalLoginHistoryData {
    return safeParseJson(localStorage.getItem(this.getKey()), {}) || {};
  }
  private setMetaData(data: Partial<LocalLoginHistoryData>) {
    const oldData = this.getMetaData();
    localStorage.setItem(this.getKey(), JSON.stringify(Object.assign(oldData, data)));
  }
  public getLastLoginVersion() {
    return this.getMetaData().version;
  }
  public isNewVersion() {
    return this.getLastLoginVersion() !== currentVersion;
  }
  public isNewUser() {
    return !this.getLastLoginVersion();
  }
  public registerUser() {
    this.setMetaData({ version: '1' });
  }
  public updateVersion() {
    this.setMetaData({ version: currentVersion });
  }
}

export default new localLoginHistory();

/*
 * Copyright 2024 OceanBase
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

import IndexDBStore from './indexDBStore';

export interface IMetaStore {
  setItem(key: string, item: any): Promise<boolean>;
  getItem(key: string): Promise<any>;
  removeItem(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  getAllItem(): Promise<any[]>;
}
let ins: {
  metaStore: IMetaStore;
} = {
  metaStore: null,
};

export async function initMetaStore() {
  if (!ins.metaStore) {
    ins.metaStore = new IndexDBStore();
  }
}

export function getMetaStoreInstance() {
  return ins.metaStore;
}

export default ins;

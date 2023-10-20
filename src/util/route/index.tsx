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

export function gotoSQLWorkspace(
  projectId?: number,
  datasourceId?: number,
  databaseId?: number,
  currentPage?: boolean,
  tabKey: string = '',
) {
  const url =
    location.origin +
    location.pathname +
    (tabKey
      ? `#/sqlworkspace/${tabKey}/${datasourceId}`
      : `#/sqlworkspace?projectId=${projectId || ''}&datasourceId=${
          datasourceId || ''
        }&databaseId=${databaseId || ''}`);

  const name = 'sqlworkspace' + '%' + login.organizationId + tabKey;
  if (currentPage) {
    location.href = url;
    window.name = name;
    return;
  }
  window.open(url, name);
}

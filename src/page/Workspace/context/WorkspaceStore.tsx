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

import { useState } from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from './ActivityBarContext';
import ResourceTreeContext, { ResourceTreeTab } from './ResourceTreeContext';
import tracert from '@/util/tracert';

export default function WorkspaceStore({ children }) {
  const [activityBarKey, setActivityBarKey] = useState(ActivityBarItemType.Database);

  const [selectTabKey, _setSelectTabKey] = useState<ResourceTreeTab>(ResourceTreeTab.datasource);
  function setSelectTabKey(v: ResourceTreeTab) {
    tracert.click(
      v === ResourceTreeTab.datasource
        ? 'a3112.b41896.c330988.d367622'
        : 'a3112.b41896.c330988.d367621',
    );
    _setSelectTabKey(v);
  }

  const [selectProjectId, setSelectProjectId] = useState<number>(null);
  const [selectDatasourceId, setSelectDatasourceId] = useState<number>(null);

  return (
    <ResourceTreeContext.Provider
      value={{
        selectTabKey,
        setSelectTabKey,
        selectProjectId,
        selectDatasourceId,
        setSelectDatasourceId,
        setSelectProjectId,
      }}
    >
      <ActivityBarContext.Provider
        value={{
          activeKey: activityBarKey,
          setActiveKey: setActivityBarKey,
        }}
      >
        {children}
      </ActivityBarContext.Provider>
    </ResourceTreeContext.Provider>
  );
}

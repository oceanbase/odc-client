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

import { useCallback, useState } from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from './ActivityBarContext';
import ResourceTreeContext, { ResourceTreeTab } from './ResourceTreeContext';
import tracert from '@/util/tracert';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import login from '@/store/login';
import { useRequest } from 'ahooks';
import { getDataSourceGroupByProject } from '@/common/network/connection';
import { listProjects } from '@/common/network/project';
import { useParams } from '@umijs/max';
import { toInteger } from 'lodash';

export default function WorkspaceStore({ children }) {
  const [activityBarKey, setActivityBarKey] = useState(ActivityBarItemType.Database);
  const { datasourceId } = useParams<{ datasourceId: string }>();
  const [selectTabKey, _setSelectTabKey] = useState<ResourceTreeTab>(ResourceTreeTab.datasource);
  function setSelectTabKey(v: ResourceTreeTab) {
    tracert.click(
      v === ResourceTreeTab.datasource
        ? 'a3112.b41896.c330988.d367622'
        : 'a3112.b41896.c330988.d367621',
    );
    _setSelectTabKey(v);
  }

  const [selectProjectId, _setSelectProjectId] = useState<number>(null);
  const [selectDatasourceId, _setSelectDatasourceId] = useState<number>(
    datasourceId ? toInteger(datasourceId) : null,
  );
  const [datasourceList, setDatasourceList] = useState<IDatasource[]>([]);
  const [projectList, setProjectList] = useState<IProject[]>([]);

  function setSelectProjectId(v: number) {
    _setSelectProjectId(v);
    _setSelectDatasourceId(null);
  }

  function setSelectDatasourceId(v: number) {
    _setSelectProjectId(null);
    _setSelectDatasourceId(v);
  }

  const { loading: dsLoading, run: fetchDatasource } = useRequest(getDataSourceGroupByProject, {
    defaultParams: [login.isPrivateSpace()],
    manual: true,
  });
  const { loading: projLoading, run: fetchProject } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999, false],
    manual: true,
  });

  const reloadDatasourceList = useCallback(async () => {
    const data = await fetchDatasource();
    setDatasourceList(data?.contents || []);
  }, []);

  const reloadProjectList = useCallback(async () => {
    const data = await fetchProject(null, 1, 99999, false);
    setProjectList(data?.contents || []);
  }, []);

  return (
    <ResourceTreeContext.Provider
      value={{
        selectTabKey,
        setSelectTabKey,
        selectProjectId,
        selectDatasourceId,
        setSelectDatasourceId,
        setSelectProjectId,
        datasourceList,
        reloadDatasourceList,
        projectList,
        reloadProjectList,
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

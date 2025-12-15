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

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from './ActivityBarContext';
import ResourceTreeContext from './ResourceTreeContext';
import tracert from '@/util/tracert';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import login from '@/store/login';
import { useRequest } from 'ahooks';
import { getDataSourceGroupByProject } from '@/common/network/connection';
import { listProjects } from '@/common/network/project';
import { useParams } from '@umijs/max';
import { toInteger } from 'lodash';
import datasourceStatus from '@/store/datasourceStatus';
import { listDatabases, listDatabasesParams } from '@/common/network/database';
import { IDatabase } from '@/d.ts/database';
import { DBObjectSyncStatus, DatabaseGroup } from '@/d.ts/database';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';

export default function WorkspaceStore({ children }) {
  const [activityBarKey, setActivityBarKey] = useState(ActivityBarItemType.Database);
  const { datasourceId } = useParams<{ datasourceId: string }>();
  const [currentObject, setCurrentObject] = useState<{
    value: React.Key;
    type: ResourceNodeType;
  }>(undefined);
  const [shouldExpandedKeys, setShouldExpandedKeys] = useState<React.Key[]>([]);
  const [groupMode, _setGroupMode] = useState(
    login.isPrivateSpace() ? DatabaseGroup.dataSource : DatabaseGroup.project,
  );

  const setGroupMode = (type: DatabaseGroup) => {
    localStorage.setItem('resourceTreeGroupMode', type);
    _setGroupMode(type);
  };

  useEffect(() => {
    const type = localStorage.getItem('resourceTreeGroupMode');
    if (type && type !== 'null' && type !== 'undefined') {
      if (
        login.isPrivateSpace() &&
        [DatabaseGroup.project, DatabaseGroup.none].includes(type as DatabaseGroup)
      ) {
        return;
      }
      _setGroupMode(type as DatabaseGroup);
    }
  }, []);

  const [selectProjectId, _setSelectProjectId] = useState<number>(null);
  const [selectDatasourceId, _setSelectDatasourceId] = useState<number>(
    datasourceId ? toInteger(datasourceId) : null,
  );
  const [datasourceList, setDatasourceList] = useState<IDatasource[]>([]);
  const [projectList, setProjectList] = useState<IProject[]>([]);
  const [databaseList, setDatabaseList] = useState<IDatabase[]>([]);

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

  const { run: fetchDatabases } = useRequest(listDatabases, {
    manual: true,
  });

  const reloadDatasourceList = useCallback(async () => {
    const data = await fetchDatasource();
    setDatasourceList(data?.contents || []);
    datasourceStatus.asyncUpdateStatus(data?.contents?.map((a) => a.id));
  }, []);

  const reloadProjectList = useCallback(async () => {
    const data = await fetchProject(null, 1, 99999, false);
    setProjectList(data?.contents || []);
  }, []);

  const reloadDatabaseList = useCallback(async () => {
    const params: listDatabasesParams = {
      page: 1,
      size: 99999,
      containsUnassigned: true,
      existed: true,
      includesPermittedAction: true,
    };
    // 个人空间不需要获取数据库的权限
    if (login?.isPrivateSpace()) {
      params.includesPermittedAction = false;
    }
    const data = await fetchDatabases(params);
    let list = data?.contents;
    if (!login?.isPrivateSpace()) {
      list = data?.contents?.filter((item) => !!item?.authorizedPermissionTypes?.length) || [];
    }
    setDatabaseList(list);
    return list;
  }, [login?.isPrivateSpace()]);

  const { run: pollingDatabase, cancel } = useRequest(
    async () => {
      const databaseList = await reloadDatabaseList();
      const arr = [DBObjectSyncStatus.SYNCING, DBObjectSyncStatus.PENDING];
      if (!databaseList?.find((item) => arr?.includes(item.objectSyncStatus))) {
        cancel();
      }
    },
    {
      pollingInterval: 30000,
      pollingWhenHidden: false,
      manual: true,
    },
  );

  return (
    <ResourceTreeContext.Provider
      value={{
        selectProjectId,
        selectDatasourceId,
        setSelectDatasourceId,
        setSelectProjectId,
        datasourceList,
        reloadDatasourceList,
        projectList,
        reloadProjectList,
        setCurrentObject,
        shouldExpandedKeys,
        setShouldExpandedKeys,
        currentObject,
        databaseList,
        reloadDatabaseList,
        pollingDatabase,
        groupMode,
        setGroupMode,
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

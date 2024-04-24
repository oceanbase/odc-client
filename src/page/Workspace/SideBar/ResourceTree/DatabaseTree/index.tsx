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

import React, { useContext, useEffect, useState } from 'react';
import ResourceTree from '..';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import TreeTitle from './Title';
import datasourceStatus from '@/store/datasourceStatus';
import { IDatabase } from '@/d.ts/database';

interface IProps {
  openSelectPanel?: () => void;
}

const DatabaseTree: React.FC<IProps> = function ({ openSelectPanel }) {
  const {
    selectDatasourceId,
    selectProjectId,
    projectList,
    datasourceList,
    databaseList,
    reloadDatabaseList,
  } = useContext(ResourceTreeContext);
  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const selectProject = projectList?.find((p) => p.id == selectProjectId);
  const selectDatasource = datasourceList?.find((d) => d.id == selectDatasourceId);

  async function reloadDatabase() {
    await reloadDatabaseList();
  }

  useEffect(() => {
    if (selectDatasourceId || selectProjectId) {
      reloadDatabase();
    }
  }, [selectDatasourceId, selectProjectId]);

  useEffect(() => {
    if (databaseList.length) {
      setDatabases(databaseList?.filter((item) => !!item?.authorizedPermissionTypes?.length));
      const ids: Set<number> = new Set();
      databaseList.forEach((d) => {
        ids.add(d.dataSource?.id);
      });
      datasourceStatus.asyncUpdateStatus(Array.from(ids));
    }
  }, [databaseList]);

  function ProjectRender() {
    return (
      <ResourceTree
        stateId={'project-' + selectProjectId}
        reloadDatabase={() => reloadDatabase()}
        databaseFrom={'project'}
        title={<TreeTitle project={selectProject} />}
        databases={databases}
        onTitleClick={() => openSelectPanel()}
        enableFilter
        showTip
      />
    );
  }
  function DatasourceRender() {
    return (
      <ResourceTree
        stateId={'datasource-' + selectDatasourceId}
        reloadDatabase={() => reloadDatabase()}
        databaseFrom={'datasource'}
        title={<TreeTitle datasource={selectDatasource} />}
        databases={databases}
        onTitleClick={() => openSelectPanel()}
      />
    );
  }
  return selectDatasourceId ? DatasourceRender() : ProjectRender();
};

export default DatabaseTree;
